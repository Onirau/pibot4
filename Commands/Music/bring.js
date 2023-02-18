const { QueryType } = require('discord-player');
const { ApplicationCommandOptionType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "bring",
    description: "Brings the Radio into VC.",
    category: "music",
    data: new SlashCommandBuilder()
    ,
    async execute(Client, interaction){
        if(!interaction.member.voice.channel) {
            await interaction.reply({content:"You must be in a VC to do this action.", ephemeral:true})
            return
        };

        const Queue = await Client.Player.getQueue(interaction.guildId)
        if (!Queue) {
            return
        }
        
        await interaction.reply({content:"Coming!.", ephemeral:true})

        await Queue.connect(interaction.member.voice.channel)
        Queue.metadata.channel = interaction.member.voice.channel

        Queue.setPaused(false)
        if (!Queue.playing) await Queue.play();
    }
}