const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { google } = require('googleapis');

const Clash = require('../modules/clash.js');
const IP = require('../modules/ip.js');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

exports.run = async (client, message, args) => {
    if (!args.length) {
        return message.channel.send(`You didn't provide arguments, ${message.author}!`);
    }

    if (!args[0]) {
        return message.channel.send(`You didn't provide clantag, ${message.author}!`);
    }

    if (!args[1]) {
        return message.channel.send(`You didn't provide spreadsheet, ${message.author}!`);
    }

    const clashdeveloper_email_address = process.env.CLASH_DEVELOPER_EMAIL;
    const clashdeveloper_password = process.env.CLASH_DEVELOPER_PASSWORD;
    // Get external IP
    const external_ip = await IP.getMyIP();

    const token = await Clash.getToken(external_ip, clashdeveloper_email_address, clashdeveloper_password);

    const { memberList, name, badgeUrls } = await fetch(`${client.config.cocUrl}/clans/${encodeURIComponent(args[0])}`, {
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
};
