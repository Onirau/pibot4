// MUSIC BOT : MADE TO BE SELF-HOSTED ON A RASPBERRY PI 4

// -------------------------------------------------------------- //


// Imports
const Discord = require("discord.js");
const fs = require('fs');
const { Player, QueueRepeatMode } = require("discord-player");
const { QueryType } = require("discord-player");
const { EmbedBuilder } = require("@discordjs/builders");
require('dotenv').config();

// Classes

class RadioChannel {
    constructor(playlist_url, title, id, author, query){
        this.url = playlist_url;
        this.title = title;
        this.id = id
        this.author = author;
        this.query = query;
    }
}

// Constant Variables
const IntentField = new Discord.IntentsBitField();
IntentField.add(Discord.IntentsBitField.Flags.Guilds, Discord.IntentsBitField.Flags.GuildMessages, Discord.IntentsBitField.Flags.MessageContent, Discord.IntentsBitField.Flags.GuildVoiceStates, Discord.IntentsBitField.Flags.GuildMessageReactions);

const Client = new Discord.Client({intents: IntentField});

const Radio_GuildID = "860235770564575272"
const Radio_ChannelID = "1038490826717798440"
const Radio_Report_ChannelID = "1060547654142148659"

// -- Commands Binding

Client.Player = new Player(Client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

Client.Commands = new Discord.Collection();

Client.Channels = [
    new RadioChannel("https://open.spotify.com/playlist/1QMt9qudGl0kUiNuDoJKf9?si=6d3fe83bfbee4d71", "Test", "test", "Rile", QueryType.SPOTIFY_PLAYLIST)
] // Radio Channels

function getDirectories(distPath) {
    return fs.readdirSync(distPath).filter(function (file) {
        return fs.statSync(distPath + '/' + file).isDirectory();
    }).filter(function (distPath) {
        return distPath
    });
}

function getCommands(distPath, isRoot){
    isRoot = isRoot || false
    const commandFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.js'));
    for(const file of commandFiles){
        const command = require(`${distPath}/${file}`);

        if(isRoot){
            console.log(`Pushing (${distPath}${command.name})`)
        }else{
            console.log(`Pushing (${distPath}/${command.name})`)
        }
    
        Client.Commands.set(command.name, command);

        // CHECK FOR RUNTIME (deprecated)
        // const runTime = Client.commands.get(command.name).runtime
        // if(runTime){
        //     runTime(Client, data);
        // }
    };
}




function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

async function GetTracks(radioChannelID){
    var tracks = []

    await new Promise((resolve, reject) => {
        for(const radio_channel of Client.Channels) {
            if (radioChannelID.toLowerCase() === radio_channel.id) {
                resolve(radio_channel);
            }
        }
        reject("Couldn't find radio channel")
    }).then(async (radio_channel) => {
        var results = await Client.Player.search(radio_channel.url, {
            searchEngine: radio_channel.query
        })
        
        tracks = results.tracks

        console.log(tracks.length)

        tracks = shuffle(tracks)         
    }).catch(() => {
        return
    })

    return tracks
}

function GetEmbed() {
    var embed = new EmbedBuilder()
    .setTitle("Pi Radio")
    .setColor(0x18e1ee)
    .setTimestamp(Date.now())

    return embed
}

Client.GetEmbed = GetEmbed
Client.GetTracks = GetTracks

const subFolders = getDirectories('./Commands/')
for(const subFolder of subFolders){
    getCommands(`./Commands/${subFolder}`)
};

// Get JS Files without a subfolder
getCommands("./commands/", true)

// -- Events

// On Ready
Client.on("ready", async () => {
    await console.log("Loading Slash Commands...");

    var SlashCommands = [];

    // Begin loading slash commands
    await Client.Commands.every(async (value, key) => { 
        const SlashCommand = value.data

        console.log(`Loading (${value.name})`)

        SlashCommand.setName(value.name)
        SlashCommand.setDescription(value.description)

        await SlashCommands.push(SlashCommand);
    });

    SlashCommands.map(command => command.toJSON());

    // Register slash commands
    const REST = new Discord.REST({version: '10'}).setToken(process.env.token);
    const Routes = Discord.Routes;
    REST.put(Routes.applicationCommands(Client.user.id), {body: SlashCommands});

    await console.log("Loaded!");

    // -- Load Radio Functionality  --
    Client.Default_Guild = await Client.guilds.resolve(Radio_GuildID);
    Client.Default_Channel = await Client.Default_Guild.channels.resolve(Radio_ChannelID)

    console.log("Queue Created...")

    Queue = await Client.Player.createQueue(Client.Default_Guild, {
        leaveOnEmpty: false,
        leaveOnEnd: false,
        metadata: {
            channel: Client.Default_Channel
        }
    });

    Queue.repeatMode = QueueRepeatMode.QUEUE

    // var results = await Client.Player.search("https://open.spotify.com/playlist/1QMt9qudGl0kUiNuDoJKf9?si=6d3fe83bfbee4d71", {
    //     searchEngine: QueryType.AUTO
    // })

    // await Queue.addTracks(results.tracks)

    // console.log("Tracks Added...")

    var Tracks = await GetTracks("test")

    await Queue.clear();
    await Queue.skip();
    await Queue.addTracks(Tracks)

    await Queue.connect(Client.Default_Channel);

    console.log("Connected...")

    if (!Queue.playing) await Queue.play();
    if(Queue.metadata.channel.members.size > 1){ // More than one to include the bot itself.
        console.log("Start Playing...")
        Queue.setPaused(false)
    }else{
        Queue.setPaused(true)
    }
});

Client.Player.on("trackStart", async (Queue, track) => {
    const Channel = await Client.guilds.resolve(Radio_Report_ChannelID);

    if (Channel){
        Channel.send({content:"Now Playing NEXT TRACK!"})
    }
})

Client.Player.on("voiceStateUpdate", async (Queue, o, n) => {
    if (n.member.user.bot) return;

    if (o.channelId && (!n.channelId) && o.channelId == Queue.metadata.channel.id) {
        if(Queue.metadata.channel.members.size == 1){ // More than one to include the bot itself.
            console.log("PAUSE FOR SAVING.")
            Queue.setPaused(true)
        }
    }else if((!o.channelId) && n.channelId && n.channelId == Queue.metadata.channel.id) {
        if(Queue.metadata.channel.members.size > 1){ // More than one to include the bot itself.
            console.log("UNPAUSE - NO LONGER SAVE.")
            if (!Queue.playing) await Queue.play();
            Queue.setPaused(false)
        }
    }
})

Client.Player.on("botDisconnect", async (Queue) => {
    const newQueue = await Client.Player.createQueue(Client.Default_Guild, {
        metadata: {
            channel: Client.Default_Channel
        }
    });

    newQueue.repeatMode = QueueRepeatMode.QUEUE

    if (Queue.tracks.length > 0){
        await newQueue.addTracks(Queue.tracks)
    }

    

    if (!Queue.playing) await Queue.play();
    if(Queue.metadata.channel.members.size > 1){ // More than one to include the bot itself.
        console.log("Start Playing...")
        Queue.setPaused(false)
    }else{
        Queue.setPaused(true)
    }

    await newQueue.connect(Client.Default_Channel);
})

// Respond to commands
Client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

    const command = (interaction.commandName).toLowerCase()

    try{
        Client.Commands.every(function(value, key) {
            if(command === (value.name).toLowerCase()) {
                Client.Commands.get(command).execute(Client, interaction)

                return false;
            }

            return true;
        })
    }catch(err){
        console.log(err);

        return err;
    };
});

Client.login(process.env.token);