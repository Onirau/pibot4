const { QueryType } = require('discord-Player');
const { ApplicationCommandOptionType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "np",
    description: "What song is playing in the queue.",
    category: "music",
    data: new SlashCommandBuilder()
    ,
    async execute(Client, interaction){
        if(!interaction.member.voice.channel) {
            await interaction.reply({content:"You must be in a VC to do this action.", ephemeral:true})
    
            return
        };

        await interaction.deferReply({fetchReply: true, ephemeral: true});

        const Queue = await Client.Player.getQueue(interaction.guildId)
        if (!Queue) {
            var addedEmbed = Client.GetEmbed()
            .setDescription('There are no songs in the queue')

            await interaction.editReply({
                embeds: [addedEmbed]
            })

            return
        }

        let bar = Queue.createProgressBar({
            queue: false,
            length: 19
        })

        const Song = Queue.nowPlaying();

        var addedEmbed = Client.GetEmbed()
        .setDescription('Music Playing')
        .setThumbnail(Song.thumbnail)
        .addFields(
            {
                name: `Currently Playing **${Song.title}**`,
                value: `( ${Song.url} )`
            },
            {
                name: `Made by **${Song.author}**`,
                value: bar
            }
        )

        await interaction.editReply({
            embeds: [addedEmbed]
        })
    }
}
