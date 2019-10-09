var auth = require('./auth.json');
const Discord = require('discord.js');
var atob = require('atob');

const client = new Discord.Client();

module.exports = (res) => {

    client.on('ready', () => {
        if (res) {
            res.write('\n' + `Logged in as ${client.user.tag}!`);
        } else {
            console.log(`Logged in as ${client.user.tag}!`);
        }

    });

    client.on('message', msg => {
        if (msg.content === 'ping') {
            msg.reply('Pong!');
        }
    });

    client.login(atob(auth.token));
}