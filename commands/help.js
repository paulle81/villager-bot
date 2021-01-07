const { MessageEmbed } = require('discord.js');

exports.run = (client, message) => {
    const exampleEmbed = new MessageEmbed()
        .setColor('#32a852')
        .setTitle('Villager help')
        .setDescription('Help section')
        .addFields(
            {
                name: '!vr help',
                value: 'This command',
            },
            {
                name: '!vr roster <clantag> <googleSheetId> <sheetName>(optional)',
                value: 'The command used to check if people on your roster are in your clan\nExample: `!roster #8Q82J2CR 1voT8MyUzE2LD8IhfQTgQCKIfEfZoCMlqYS9mfWwUOlg Sheet4`',
            },
        )
        .setTimestamp();

    message.channel.send(exampleEmbed);
};
