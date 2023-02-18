const { QueryType } = require('discord-player');
const { ApplicationCommandOptionType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "away",
    description: "Sends the Radio into Default.",
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
        
        await interaction.reply({content:"Cya!", ephemeral:true})

        await Queue.connect(Client.Default_Channel)
        Queue.metadata.channel = Client.Default_Channel

        Queue.setPaused(true)
    }
}