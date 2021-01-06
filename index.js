require('dotenv').config();
const { Client, MessageEmbed } = require('discord.js');
const { prefix, cocUrl } = require('./config.json');
const fetch = require('node-fetch');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const IP = require('./modules/ip.js');
const Clash = require('./modules/clash.js');

const client = new Client();

client.once('ready', () => {
    console.log('Ready!');
});

(async () => {
    try {
        const clashdeveloper_email_address = process.env.CLASH_DEVELOPER_EMAIL;
        const clashdeveloper_password = process.env.CLASH_DEVELOPER_PASSWORD;
        // Get external IP
        const external_ip = await IP.getMyIP();

        // Get developer token
        const token = await Clash.getToken(external_ip, clashdeveloper_email_address, clashdeveloper_password);

        client.on('message', async message => {
            if (!message.content.startsWith(prefix) || message.author.bot) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'roster') {
                if (!args.length) {
                    return message.channel.send(`You didn't provide arguments, ${message.author}!`);
                }

                if (!args[0]) {
                    return message.channel.send(`You didn't provide clantag, ${message.author}!`);
                }

                if (!args[1]) {
                    return message.channel.send(`You didn't provide spreadsheet, ${message.author}!`);
                }

                const { memberList, name, badgeUrls } = await fetch(`${cocUrl}/clans/${encodeURIComponent(args[0])}`, {
                    headers: {
                        Accept: 'application/json',
                        authorization: `Bearer ${token}`,
                    },
                }).then(response => response.json());
                const range = `${args[2] || 'Sheet1'}!A:B`;

                if (memberList === undefined) {
                    return message.channel.send(`${args[0]} is not a valid clantag`);
                }

                const clientJWT = new google.auth.JWT(
                    process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY.replace(/\\n/gm, '\n'), SCOPES,
                );

                clientJWT.authorize((err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    else {
                        console.log('connected');
                        gsrun(clientJWT);
                    }
                });

                const gsrun = async (cl) => {
                    const gsapi = google.sheets({
                        version: 'v4',
                        auth: cl,
                    });

                    const opt = {
                        spreadsheetId: args[1],
                        range,
                    };

                    try {
                        const { data } = await gsapi.spreadsheets.values.get(opt);

                        if (data.values.length) {
                            const rostered = [];

                            data.values.map(row => rostered.push({ name: row[0], tag: row[1] }));

                            // eslint-disable-next-line max-nested-callbacks
                            const currentlyIn = rostered.filter(e => memberList.find(member => member.tag === e.tag));
                            const notIn = rostered.filter(x => !currentlyIn.includes(x));

                            const exampleEmbed = new MessageEmbed()
                                .setColor('#32a852')
                                .setTitle(name)
                                .setDescription('It\'s almost time to war, start gathering the troops.')
                                .setThumbnail(badgeUrls.small)
                                .addFields(
                                    {
                                        name: 'These people are not in clan',
                                        value: notIn.map(e => e.name).join('\n') || 'Everyone is in clan',
                                    },
                                )
                                .setTimestamp();

                            message.channel.send(exampleEmbed);
                        }
                    }
                    catch (err) {
                        console.error(err);
                        message.channel.send('Spreadsheet ID is invalid or not public');
                    }


                };
            }
            else if (command === 'help') {
                const exampleEmbed = new MessageEmbed()
                    .setColor('#32a852')
                    .setTitle('Villager help')
                    .setDescription('Help section')
                    .addFields(
                        {
                            name: '!help',
                            value: 'This command',
                        },
                        {
                            name: '!roster <clantag> <googleSheetId> <sheetName>(optional)',
                            value: 'The command used to check if people on your roster are in your clan\nExample: `!roster #8Q82J2CR 1voT8MyUzE2LD8IhfQTgQCKIfEfZoCMlqYS9mfWwUOlg Sheet4`',
                        },
                    )
                    .setTimestamp();

                message.channel.send(exampleEmbed);
            }
        });

    }
    catch (err) {
        console.error(err);
    }
})();

client.login(process.env.DISCORD_TOKEN);
