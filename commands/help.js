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
                name: '!vr setclan <clantag>',
                value: 'Sets the clan for the server',
            },
            {
                name: '!vr missing <googleSheetId> <sheetName>(optional)',
                value: 'The command used to check if people on your roster are in your clan\nExample: `!vr missing 1voT8MyUzE2LD8IhfQTgQCKIfEfZoCMlqYS9mfWwUOlg Sheet4`',
            },
        )
        .setTimestamp();

    message.channel.send(exampleEmbed);
};
