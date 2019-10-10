var auth = require('./auth.json');
const Discord = require('discord.js');
var atob = require('atob');
var schedule = require('node-schedule');
const fs = require('fs');


const channelID = "588743997665705985";
const guildMember = "<@&442657945017253892>";
const client = new Discord.Client();

var readFile = () => {
    var rawdata = fs.readFileSync('message.json');
    var message = JSON.parse(rawdata);
    fs.close();
    return message.message;
}

var writeFile = (link) => {
    let message = {
        message: link
    };
    let data = JSON.stringify(message);
    fs.writeFileSync('message.json', data);
    fs.close();
}

var sendForms = () => {
    client.channels.get(channelID).send(guildMember + ' Here are the forms for this week! : ' + readFile());
}

var schedulerProcess = (dayOfWeek, hour, minute) => {
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = dayOfWeek;
    rule.hour = hour;
    rule.minute = minute;
    var sche = schedule.scheduleJob(rule, function () {
        sendForms();
    });

}

var scheduler = () => {
    schedulerProcess(3, 21, 1);
    schedulerProcess(4, 21, 1);
    schedulerProcess(5, 21, 1);
    schedulerProcess(4, 8, 51);
    schedulerProcess(5, 8, 51);
}

checkAdminRights = (msg) => {
    var right = msg.member.roles.some(role => role.name.includes("Officer") || role.name.includes("Admin")
        || role.name.includes("Queen") || role.name.includes("King") || role.name.includes("Moderator"));

    if (!right) {
        msg.delete(1000);
        msg.reply("Sorry you dont have permission to use this :(");
    }
    console.log(right);
    return right;
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

        if (msg.content.startsWith('!update_forms') && checkAdminRights(msg)) {

            var msgArr = (msg.content.split(' '));
            var link = msgArr.length > 0 ? msgArr[1] : 'no link defined, please contact Kiki';
            msg.delete(1000);
            writeFile(link);
            sendForms();
        }

        if (msg.content === '!rsvp_help' && checkAdminRights(msg)) {
            var guide = "\n1) making update to RSVP Sheet : \n!update_forms https://www.google.com \n2) to show me the current time : \n!tell_time";
            msg.delete(1000);
            msg.channel.send(guide);

        }

        if (msg.content === '!tell_time' && checkAdminRights(msg)) {
            var datetime = (new Date()).toLocaleString();
            msg.delete(1000);
            msg.channel.send(datetime);
        }
    });

    client.login(atob(auth.token));
}