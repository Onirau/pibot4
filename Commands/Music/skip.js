const { QueryType } = require('discord-player');
const { ApplicationCommandOptionType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "skip",
    description: "Skips to the next song in the queue.",
    category: "music",
    data: new SlashCommandBuilder()
    ,
    async execute(Client, interaction){
        if(!interaction.member.voice.channel) {
            await interaction.reply({content:"You must be in a VC to do this action.", ephemeral:true})
    
            return
        };
        
        await interaction.deferReply({fetchReply: true, ephemeral: false});

        const Queue = await Client.Player.getQueue(interaction.guildId)
        if (!Queue) {
            var addedEmbed = Client.GetEmbed()
            .setDescription('There are no songs in the queue')

            await interaction.editReply({
                embeds: [addedEmbed]
            })

            return
        }

        const currentSong = Queue.nowPlaying();

        Queue.skip()

        var addedEmbed = Client.GetEmbed()
        .setDescription('Music Skipped')
        .setThumbnail(currentSong.thumbnail)
        .addFields(
            {
                name: `**${currentSong.title}** has been skipped`,
                value: `Requested by **${interaction.member.user.tag}** (**${interaction.member.id}**))`
            }
        )

        await interaction.editReply({
            embeds: [addedEmbed]
        })
    }
}