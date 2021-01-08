require('dotenv').config();
const { Client } = require('discord.js');

const client = new Client();

client.once('ready', async () => {
    console.log('Ready!');
});

client.login(process.env.DISCORD_TOKEN);