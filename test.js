require('dotenv').config();
const { Client } = require('discord.js');

const welcome = require('./welcome');

const client = new Client();

client.once('ready', async () => {
    console.log('Ready!');

    welcome(client);
});

client.login(process.env.DISCORD_TOKEN);