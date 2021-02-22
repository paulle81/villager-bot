const { MessageEmbed } = require('discord.js');

exports.run = (_client, message) => {
    const exampleEmbed = new MessageEmbed()
        .setColor('#32a852')
        .setTitle('Villager help')
        .setDescription('You will need to setclan first')
        .addFields(
            {
                name: '!vr help',
                value: 'This command',
            },
            {
                name: '!vr setclan <clantag>(ADMIN only)',
                value: 'Sets the clan for the server\nExample: `!vr setclan #xyz789`',
            },
            {
                name: '!vr addplayer <playertag> <discordTag>(ADMIN only)',
                value: 'Sets the playertag for the discord user\nExample: `!vr addplayer #abc123 @ple81`',
            },
            {
                name: '!vr missing <googleSheetId> <sheetName>(optional)',
                value: 'The command used to check if people on your roster are in your clan\nExample: `!vr missing 1voT8MyUzE2LD8IhfQTgQCKIfEfZoCMlqYS9mfWwUOlg Sheet4`',
            },
            {
                name: '!vr mlcwsetsheet <googleSheetId>(ADMIN only)',
                value: 'The command to set the MLCW dashboard sheet\nExample: `!vr mlcwsetsheet 1voT8MyUzE2LD8IhfQTgQCKIfEfZoCMlqYS9mfWwUOlg`',
            },
            {
                name: '!vr mlcwmissing Week x(x is the week number)',
                value: 'The command used to check if people on your roster are in your clan for the week\nExample: `!vr mlcwmissing Week 1`',
            },
        )
        .setTimestamp();

    message.channel.send(exampleEmbed);
};
