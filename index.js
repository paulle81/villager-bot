require('dotenv').config();
const { Client, Collection } = require('discord.js');
const fs = require('fs');
const mongo = require('./modules/mongo');
const config = require('./config.json');

const client = new Client();
client.config = config;

client.once('ready', async () => {
    console.log('Ready!');

    await mongo();
});

fs.readdir('./events/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        const eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
    });
});

client.commands = new Collection();

fs.readdir('./commands/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const props = require(`./commands/${file}`);
        const commandName = file.split('.')[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});

client.login(process.env.DISCORD_TOKEN);
