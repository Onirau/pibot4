const { QueryType } = require('discord-Player');
const { ApplicationCommandOptionType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "queue",
    description: "Shows the queue.",
    category: "music",
    data: new SlashCommandBuilder().addNumberOption((option) => option.setName("page").setDescription("What page of the queue you want to see.").setMinValue(1))
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

        const totalPages = Math.ceil(Queue.tracks.length / 10) || 1
        const page = (interaction.options.getNumber("page") || 1) - 1


        await console.log(Queue.tracks.length)
        if (page > totalPages){
            var addedEmbed = Client.GetEmbed()
            .setDescription(`There are only **${totalPages}** pages in the queue.`)

            await interaction.editReply({
                embeds: [addedEmbed]
            })

            return
        }

        const queueString = Queue.tracks.slice(page*10, page*10+10).map((song, i) => {
            const originalTitle = song.title
            var limitedTitle = originalTitle.substring(0, 20)
            if(!(originalTitle === limitedTitle)) limitedTitle = limitedTitle + "..."
            return `**( ${page*10+i+1} )** \`[${song.duration}]\` ${limitedTitle} - ${song.author}`
        }).join(`\n`);

        const currentSong = Queue.nowPlaying();

        const originalTitle = currentSong.title
        var limitedTitle = originalTitle.substring(0, 30)

        if(!(originalTitle === limitedTitle)) limitedTitle = limitedTitle + "..."

        var addedEmbed = Client.GetEmbed()
        .setDescription(
            `**Now Playing**\n` +
            (currentSong ? `\`[${currentSong.duration}]\` ${limitedTitle} - ${currentSong.author}` : `None`) +
            `\n\n**Queue**\n${queueString}`
        )
        .setThumbnail(currentSong.thumbnail)
        .setFooter({
            text: `( Page ${page+1} of ${totalPages} )`
        })

        await interaction.editReply({
            embeds: [addedEmbed]
        })
    }
}