var auth = require('./auth.json');
const Discord = require('discord.js');
var atob = require('atob');
var schedule = require('node-schedule');
const fs = require('fs');
var gsjson = require('google-spreadsheet-to-json');
var creds = require('./google-generated-creds.json');

const guildID = "442656148739457034";
const channelID = "588743997665705985";
const guildMemberRoleNumber = "442657945017253892";
const guildMember = "<@&442657945017253892>";
const me = "<@548897775576678442>";
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

var checkAdminRights = (msg) => {
    var right = msg.member.roles.some(role => role.name.includes("Officer") || role.name.includes("Admin")
        || role.name.includes("Queen") || role.name.includes("King") || role.name.includes("Moderator"));

    if (!right) {
        msg.delete(1000);
        msg.reply("Sorry you dont have permission to use this :(");
    }
    return right;
}

var filterAttendance = () => {
    // var propertyArr = Object.keys(data[0]).filter((prop) => prop.startsWith("areYouAbleToJoinSiegeWar"));

    // if (propertyArr.length > 0) {
    //     var property = propertyArr[0];
    //     data.filter((row)=> {
    //        row[propertyArr].toLowerCase() == 'no' 
    //     })
    // }
    // else {
    //     msg.channel.send('Sorry not able to read sheet! Property reading has failed :( ' + me + ' please help!');
    // }
}

getGoogleSheet = () => {
    gsjson({
        spreadsheetId: '1fk8mXZhLp-IyhImLxyf-76_PTPND4hJyRwObFvUOAjU',
        credentials: './google-generated-creds.json'
        // other options...
    })
        .then((completed) => {
            var discordGuildMembers = client.guilds.get(guildID).roles.find("id", guildMemberRoleNumber).members;
            var discordCompletedMembers = completed.map((complete) => {
                var filterRes = discordGuildMembers.filter(
                    (member) => {
                        var userName = member && member.user.username ? member.user.username : '';
                        var nickName = member && member.nickname ? member.nickname : '';
                        var compare = userName.toString().toLowerCase().includes(complete.familyName.toLowerCase()) ||
                            nickName.toString().toLowerCase().includes(complete.familyName.toLowerCase());
                        return compare;
                    }
                )
                    .map((member) => {
                        return {
                            'username': member.user.username
                            // member.user.username.includes('[') && member.user.username.includes(']') ? member.user.username :  
                        }
                    });
                return filterRes[0];
            }).filter((complete) => complete !== undefined);

            var discordUncompletedMembers = discordGuildMembers.filter((member) => {
                var ind = discordCompletedMembers.findIndex(complete => {
                    var userName = member && member.user.username ? member.user.username : '';
                    return complete.username === member.user.username
                });
                return ind === -1 ? true : false;
            }).map((user) => {
                return '<@' + user.user.id + '>';
            });

            console.log('unCompletedmembers : ', discordUncompletedMembers);

            var spammer = discordUncompletedMembers.join(',');
            client.channels.get(channelID).send(guildMember + ' Please fill up the forms! ' +
                readFile() + '\n' + spammer + '\nIf you have already filled the form but see your name here inform ' + me);
        })
        .catch((err) => {
            console.log(err);
            msg.channel.send('Sorry not able to read sheet! ' + me + ' please help!');
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

        if (msg.content === '!check_members' && checkAdminRights(msg)) {
            getGoogleSheet();
        }
    });

    client.login(atob(auth.token));
}