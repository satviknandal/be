var auth = require('./auth.json');
const Discord = require('discord.js');
var atob = require('atob');
var schedule = require('node-schedule');

const client = new Discord.Client();

var scheduler = () => {
    return schedule.scheduleJob('40 * * * *', function () {
        client.channels.get("600894246899286047").send('Scheduler Triggered at minute 40!!');
    });
}


module.exports = (res) => {

    client.on('ready', () => {
        if (res) {
            res.write('\n' + `Logged in as ${client.user.tag}!`);
        } else {
            console.log(`Logged in as ${client.user.tag}!`);
        }
        var sche = scheduler();
    });

    client.on('message', msg => {
        if (msg.content === 'ping') {
            msg.reply('Pong!');
        }
    });

    client.login(atob(auth.token));
}