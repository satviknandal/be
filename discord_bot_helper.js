var auth = require('./auth.json');
const Discord = require('discord.js');
var atob = require('atob');
var schedule = require('node-schedule');
const fs = require('fs');



const channelID = "588743997665705985";
const guildMember = "<@631542036914241546>";
const client = new Discord.Client();


var readFile = () => {
    var rawdata = fs.readFileSync('message.json');
    var message = JSON.parse(rawdata);
    return message.message;
}

var writeFile = (link) => {
    let message = {
        message: link
    };
    let data = JSON.stringify(message);
    fs.writeFileSync('message.json', data);
}

var sendForms = () => {
    client.channels.get(channelID).send(guildMember + ' Here are the forms for this week! : ' + readFile());
}

var scheduler = () => {
    var wed = new schedule.RecurrenceRule();
    wed.dayOfWeek = 3;
    wed.hour = 9;

    var wedSche = schedule.scheduleJob(wed, function () {
        sendForms();
    });

    
    var thurs = new schedule.RecurrenceRule();
    thurs.dayOfWeek = 4;
    thurs.hour = 9;

    var wedSche = schedule.scheduleJob(thurs, function () {
        sendForms();
    });


    var fri = new schedule.RecurrenceRule();
    fri.dayOfWeek = 5;
    fri.hour = 9;

    var wedSche = schedule.scheduleJob(fri, function () {
        sendForms();
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
        if (msg.content.startsWith('!update_forms')) {
            var msgArr = (msg.content.split(' '));

            var link = msgArr.length > 0 ? msgArr[1] : 'no link defined, please contact Kiki';
            writeFile(link);

            sendForms();
        }
    });

    client.login(atob(auth.token));
}