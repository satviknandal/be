var auth = require('./auth.json');
const Discord = require('discord.js');
var atob = require('atob');
var schedule = require('node-schedule');
const fs = require('fs');
var gsjson = require('google-spreadsheet-to-json');
var creds = require('./google-generated-creds.json');
var sheet = require('./sheet.json');

const guildID = "442656148739457034";
const channelID = "588743997665705985";
// const guildMemberRoleNumber = "442657945017253892";
// const guildMember = "<@&442657945017253892>";

const siegeMemberRoleNumber = "632016115480133644";
const siegeMember = "<@&632016115480133644>";

const me = "<@548897775576678442>";
const client = new Discord.Client();

var readFile = (path) => {
    var rawdata = fs.readFileSync(path);
    var obj = JSON.parse(rawdata);
    return obj;
}

var writeFile = (obj, path) => {
    let data = JSON.stringify(obj);
    fs.writeFileSync(path, data);
}

var sendForms = () => {
    client.channels.get(channelID).send(siegeMember + ' Here are the forms for this week! : ' + readFile('message.json').message);
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

var getGoogleSheet = (msg) => {

    var credentials = atob(creds.json);
    console.log(credentials);

    var spreadSheetID = readFile('sheet.json').sheet;

    gsjson({
        spreadsheetId: spreadSheetID,
        credentials: credentials
        // other options...
    })
        .then((completed) => {
            var discordGuildMembers = client.guilds.get(guildID).roles.find("id", siegeMemberRoleNumber).members;
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
            var spamMessage = siegeMember + ' Please fill up the forms! ' +
                readFile() + '\n' + spammer + '\nIf you have already filled the form but see your name here inform ' + me;
            console.log('Message : ' + spamMessage);
            client.channels.get(channelID).send(spamMessage);
            msg.channel.send('Announcements Updated');
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
            writeFile({
                message: link
            }, 'message.json');
            sendForms();
            msg.channel.send('Forms for the week updated.');
        }

        if (msg.content.startsWith('!update_sheet') && checkAdminRights(msg)) {
            var msgArr = (msg.content.split(' '));
            var sheet = msgArr.length > 0 ? msgArr[1] : 'no sheet defined, please contact Kiki';
            msg.delete(1000);
            writeFile({
                sheet: sheet
            }, 'sheet.json');
            msg.channel.send('Sheet for the week updated.');
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
            getGoogleSheet(msg);
        }
    });

    client.login(atob(auth.token));
}