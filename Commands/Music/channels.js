const { QueryType } = require('discord-player');
const { ApplicationCommandOptionType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "channels",
    description: "Show what channels are available on the radio.",
    category: "music",
    data: new SlashCommandBuilder().addNumberOption((option) => option.setName("page").setDescription("What page of the queue you want to see.").setMinValue(1))
    ,
    async execute(Client, interaction){
        if(!interaction.member.voice.channel) {
            await interaction.reply({content:"You must be in a VC to do this action.", ephemeral:true})
            return
        };
        await interaction.deferReply({fetchReply: true, ephemeral: true});

        const totalPages = Math.ceil(Client.Channels.length / 10) || 1
        const page = (interaction.options.getNumber("page") || 1) - 1

        if (page > totalPages-1) {
            var addedEmbed = Client.GetEmbed()
            .setDescription(`There are only **${totalPages}** page(s) in the queue.`)

            await interaction.editReply({
                embeds: [addedEmbed]
            })

            return;
        }

        const channelString = Client.Channels.slice(page*10, page*10+10).map((channel, i) => {
            const originalTitle = channel.title
            var limitedTitle = originalTitle.substring(0, 30)
            if (!(originalTitle === limitedTitle)) limitedTitle = limitedTitle + "..."

            return `**(${channel.id})** - ${limitedTitle}`
        }).join("\n")

        var Channels_Embed = Client.GetEmbed()
        .setDescription(
            `**Channels**\n${channelString}`
        )
        .setFooter({
            text: `( Page ${page+1} of ${totalPages} )`
        })

        await interaction.editReply({
            embeds: [Channels_Embed]
        })
    }
}