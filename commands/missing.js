const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { google } = require('googleapis');

const Clash = require('../modules/clash.js');
const IP = require('../modules/ip.js');
const clanSchema = require('../schemas/clan-schema');
const playerSchema = require('../schemas/player-schema');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

exports.run = async (client, message) => {
    const { channel, content, guild } = message;

    let spreadsheetId = content;
    const split = spreadsheetId.split(' ');

    if (split.length < 3) {
        channel.send('Please provide spreadsheet ID');
        return;
    }

    split.splice(0, 2);
    spreadsheetId = split;

    const clashdeveloper_email_address = process.env.CLASH_DEVELOPER_EMAIL;
    const clashdeveloper_password = process.env.CLASH_DEVELOPER_PASSWORD;
    // Get external IP
    const external_ip = await IP.getMyIP();

    const token = await Clash.getToken(external_ip, clashdeveloper_email_address, clashdeveloper_password);

    const result = await clanSchema.findOne({ _id: guild.id });

    const clanTag = result.clanTag;

    const { memberList, name, badgeUrls } = await fetch(`${client.config.cocUrl}/clans/${encodeURIComponent(clanTag)}`, {
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).then(response => response.json());
    const range = `${spreadsheetId[1] || 'Sheet1'}!A:B`;

    if (memberList === undefined) {
        return message.channel.send(`${clanTag} is not a valid clantag`);
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
            spreadsheetId: spreadsheetId[0],
            range,
        };

        try {
            const { data } = await gsapi.spreadsheets.values.get(opt);

            if (data.values.length) {
                let rostered = [];
                let playerResult;
                let discordId;

                data.values.map(row => rostered.push({ tag: row[0], name: row[1] }));
                const promises = rostered.map(async obj => {
                    playerResult = await playerSchema.findOne({ _id: obj.tag });

                    if (playerResult !== null && playerResult._id === obj.tag) {
                        discordId = playerResult.discordId;
                    }
                    else {
                        discordId = undefined;
                    }

                    return {
                        ...obj,
                        discordId,
                    };
                });

                rostered = await Promise.all(promises);

                // eslint-disable-next-line max-nested-callbacks
                const currentlyIn = rostered.filter(e => memberList.find(x => x.tag === e.tag));
                const notIn = rostered.filter(x => !currentlyIn.includes(x));

                const exampleEmbed = new MessageEmbed()
                    .setColor('#32a852')
                    .setTitle(name)
                    .setDescription('It\'s almost time to war, start gathering the troops. These people are not in clan.')
                    .setThumbnail(badgeUrls.small)
                    .addFields(
                        {
                            name: 'Player',
                            value: notIn.map(e => {
                                const embedDiscordId = e.discordId ? `<@${e.discordId}>` : '';
                                return '`' + e.name + '\t`' + embedDiscordId;
                            }) || 'Everyone is in clan',
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
