const { QueryType } = require('discord-player');
const { ApplicationCommandOptionType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "setchannel",
    description: "Set Channel playing on the radio.",
    category: "music",
    data: new SlashCommandBuilder().addStringOption((option) => option.setName("id").setDescription("What's the id of the radio channel you want to play?"))
    ,
    async execute(Client, interaction){
        if(!interaction.member.voice.channel) {
            await interaction.reply({content:"You must be in a VC to do this action.", ephemeral:true})
            return
        };
        await interaction.deferReply({fetchReply: true, ephemeral: true});


        const Queue = await Client.Player.getQueue(interaction.guildId)
        if (!Queue) {
            return
        }

        var Tracks = await Client.GetTracks(interaction.options.getString("id"))

        await Queue.clear();
        await Queue.skip();
        // await playPlaylist(Tracks)
        
        await Queue.addTracks(Tracks)

        await Client.tryPlay(Queue)

        var Channels_Embed = Client.GetEmbed()
        .setDescription(
            `Shiiii- Sure`
        )

        await interaction.editReply({
            embeds: [Channels_Embed]
        })
    }
}