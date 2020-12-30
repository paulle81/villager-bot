const { Client, MessageEmbed } = require('discord.js');
const { prefix, cocUrl } = require('./config.json');
const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

const client = new Client();

const authorize = (credentials, spreadsheetId, callback) => {
    const { redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        process.env.client_id, process.env.client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, spreadsheetId, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, spreadsheetId);
    });
};

const getNewToken = (oAuth2Client, spreadsheetId, callback) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client, spreadsheetId);
        });
    });
};

client.once('ready', () => {
    console.log('Ready!');
});

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
                authorization: `Bearer ${process.env.cocApiToken}`,
            },
        }).then(response => response.json());
        const range = `${args[2] || 'Sheet1'}!A:B`;

        if (memberList === undefined) {
            return message.channel.send(`${args[0]} is not a valid clantag`);
        }

        const getRoster = (auth, spreadsheetId) => {
            const sheets = google.sheets({ version: 'v4', auth });
            sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                if (rows.length) {
                    const rostered = [];

                    rows.map(row => rostered.push({ name: row[0], tag: row[1] }));

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
                else {
                    console.log('No data found.');
                }
            });
        };

        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            authorize(JSON.parse(content), args[1], getRoster);
        });
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
                    value: 'The command used to check if people on your roster are in your clan',
                },
            )
            .setTimestamp();

        message.channel.send(exampleEmbed);
    }
});


client.login(process.env.discordToken);