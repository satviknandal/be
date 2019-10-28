var auth = require('./auth.json');
const Discord = require('discord.js');
var atob = require('atob');
var schedule = require('node-schedule');
const fs = require('fs');
var gsjson = require('google-spreadsheet-to-json');
var creds = require('./google-generated-creds.json');
const db = require('./db_helper');

var db_helper = db();

let setting;

let sheet;
let settings_workSheet;

let siegeMember;

let me;
let client;

let event_google_sheet = "0";

let delay = 500;

var readFile = (path) => {
    var rawdata = fs.readFileSync(path);
    var obj = JSON.parse(rawdata);
    return obj;
}

var init = (settings) => {
    return new Promise((resolve, reject) => {
        setting = null;
        setting = settings;
        console.log(setting.ID + ' VS ' + settings.ID);
        siegeMember = "<@&" + settings.Event_Role_ID + ">";
        me = "<@" + settings.Developer_ID + ">";
        client = settings.dis_client;


        db_helper.configuration_first_row(settings.ID).then((cRow) => {
            sheet = cRow.Sheet;
            settings_workSheet = cRow.Settings_WorkSheet;
            //setTimeout if needed
            resolve(true);
        })
    })
}


var writeFile = (obj, path) => {
    let data = JSON.stringify(obj);
    fs.writeFileSync(path, data);
}

var readSettings = (work_Sheet) => {
    var credentials = atob(creds.json);

    let prom = gsjson({
        spreadsheetId: sheet,
        credentials: credentials,
        worksheet: work_Sheet
        // other options...
    });

    //prom.then((obj) => { console.log(obj) });
    return prom;
}

var sendForms = () => {
    readSettings(settings_workSheet).then((ws) => {
        var workS = ws[0];
        client.channels.get(setting.Announcement_Channel_ID).send(siegeMember + ' Forms for the week have been updated on ' + workS.updated + ', and here they are! \n' + workS.g_forms_link);
    })
        .catch((err) => {
        });
}


var schedulerController = (rule, control) => {
    console.log('SCHEDULER', setting.ID, 'control : ' + control);
    var sche = schedule.scheduleJob(rule, () => {
        if (control && control === 'initial') {
            sendForms();
        }
        if (control && control === 'vacation') {
            get_non_attendance(null, control);
        }
        else {
            get_attendance(null, control);
        }
    });

}

var schedulerProcess = (dayOfWeek, hour, minute, control) => {
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = dayOfWeek;
    rule.hour = hour;
    rule.minute = minute;
    schedulerController(rule, control);
}

var scheduler = () => {
    console.log('SCHEDULER EVENT ID : ', setting.ID);
    db_helper.schedule_all_rows(setting.ID).then((sRows) => {
        sRows.forEach((sRow) => {
            schedulerProcess(sRow.DayOfWeek, sRow.Hour, sRow.Minute, sRow.Control);
        })
    })
}

var checkAdminRights = (msg) => {
    return new Promise((resolve, reject) => {
        db_helper.permissions_all_rows(setting.ID).then((perRows) => {

            var right = msg.member.roles.some(role =>
                perRows.some((perRow) => role.name.includes(perRow.Role))
            );

            if (!right) {
                msg.delete(1000);
                msg.reply("Sorry you dont have permission to use this :(");
            }

            resolve(right);
        })
    })
}


var getDiscordGuildies = (discordGuildMembers, completed) => {

    console.log('List of completed from Sheet', completed);
    var discordCompletedMembers = completed.map((complete) => {
        var filterRes = discordGuildMembers.filter(
            (member) => {
                var famName = complete.familyName.trim().toLowerCase();
                var userName = member && member.user.username ? member.user.username.toString().trim().toLowerCase() : '';
                var nickName = member && member.nickname ? member.nickname.toString().trim().toLowerCase() : '';
                var compare = userName.includes(famName) ||
                    nickName.includes(famName);
                return compare;
            }
        )
            .map((member) => {
                return {
                    'username': member.user.username,
                    'user': {
                        'id': member.user.id
                    }
                    // member.user.username.includes('[') && member.user.username.includes(']') ? member.user.username :  
                }
            });
        return filterRes[0];
    }).filter((complete) => complete !== undefined);


    return discordCompletedMembers;
}


var getGoogleSheet = (msg) => {

    return new Promise((resolve, reject) => {

        readSettings(event_google_sheet).then((completed) => {
            resolve(completed);
        }).catch((err) => {
            console.log(err);
            resolve(err);
            if (msg) {
                msg.channel.send('Sorry not able to read sheet! ' + me + ' please help!');
            }
            else {
                client.channels.get(setting.Announcement_Channel_ID).send('Sorry not able to read sheet! ' + me + ' please help!');
            }
        });
    })
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



var get_non_attendance = (msg, control) => {

    getGoogleSheet(msg).then((completed) => {
        var discordGuildMembers = client.guilds.get(setting.guild_Discord_ID).roles.find("id", setting.Event_Role_ID).members;

        var non_attendees = completed.filter((complete) => {
            var property = Object.keys(complete).filter((key) => key.toLowerCase().startsWith('areyouabletojoinsiegewar'));
            return complete[property] == 'No';
        })

        var discordNonAttendees = getDiscordGuildies(discordGuildMembers, non_attendees);

        console.log('Non Attendees : ', discordNonAttendees);

        var discordNonAttendeeMembers = discordNonAttendees.map((user) => {
            return '<@' + user.user.id + '>';
        });

        var spammer = discordNonAttendeeMembers.join('\n');

        readSettings().then((ws) => {
            var workS = ws[0];

            var spamMessage = 'Thank you for filling RSVP ' + workS.updated + ' for the week!\n' +
                'Please be reminded to set your vacation status to [Yes] before siege!' + '\n' + spammer +
                '\nAny issues please inform ' + me;

            console.log('Message : ' + spamMessage);

            if (msg) {
                msg.delete(delay);
                msg.channel.send('Vacation reminder will be sent shortly :)');
            }
            client.channels.get(setting.Announcement_Channel_ID).send(spamMessage);
        })
            .catch((err) => {

            });
    })

}


var get_astray = (msg, control) => {
    getGoogleSheet(msg).then((completed) => {
        var discordGuildMembers = client.guilds.get(setting.guild_Discord_ID).roles.find("id", setting.Event_Role_ID).members;

        var discordCompletedMembers = getDiscordGuildies(discordGuildMembers, completed);

        var discordUncompletedMembers_raw = discordGuildMembers.filter((member) => {
            var ind = discordCompletedMembers.findIndex(complete => {
                var userName = member && member.user.username ? member.user.username : '';
                return complete.username === userName;
            });
            return ind === -1 ? true : false;
        });

        var discordUncompletedMembers = discordUncompletedMembers_raw.map((user) => {
            return '<@' + user.user.id + '>';
        });

        var spammer = discordUncompletedMembers.join('\n');

        var spamMessage = 'Unfortunately the below list of members have yet to fill RSVP!' + '\n' + spammer;

        console.log('Message : ' + spamMessage);
        msg.delete(delay);
        msg.author.send(spamMessage);
    })
}



var get_attendance = (msg, control) => {
    getGoogleSheet(msg).then((completed) => {
        var discordGuildMembers = client.guilds.get(setting.guild_Discord_ID).roles.find("id", setting.Event_Role_ID).members;

        var discordCompletedMembers = getDiscordGuildies(discordGuildMembers, completed);

        var discordUncompletedMembers_raw = discordGuildMembers.filter((member) => {
            var ind = discordCompletedMembers.findIndex(complete => {
                var userName = member && member.user.username ? member.user.username : '';
                return complete.username === userName;
            });
            return ind === -1 ? true : false;
        });

        // console.log('unCompletedmembers : ', discordUncompletedMembers_raw.filter((member) => {
        //     return member && member.user && member.user.username && member.user.username.toString().includes('Thervi') ? member.user.username : ''
        // }));

        var discordUncompletedMembers = discordUncompletedMembers_raw.map((user) => {
            return '<@' + user.user.id + '>';
        });

        var spammer = discordUncompletedMembers.join('\n');

        readSettings(settings_workSheet).then((ws) => {
            var workS = ws[0];

            var spamMessage =
                control && control == 'warning' ?
                    'Unfortunately the below list of members have failed to fill up RSVP for the week (' + workS.updated + ')  :(\n' +
                    spammer + '\nIf you have already filled the form but still see your name here inform ' + me :
                    'Please fill up the document/s prepared on ' + workS.updated + ' for the week!\n' +
                    workS.g_forms_link + '\n' + spammer + '\nIf you have already filled the document but still see your name here inform ' + me;

            console.log('Message : ' + spamMessage);

            if (msg) {
                msg.delete(1000);
                msg.channel.send(control && control == 'warning' ? 'Warnings to be issued :\'(' : 'Announcements will be updated shortly :)');
            }
            client.channels.get(setting.Announcement_Channel_ID).send(spamMessage);
        })
            .catch((err) => {

            });
    })
}

let specMessages = (msg) => {

    return new Promise((resolve, reject) => {

        db_helper.guild_event_first_row({
            a: msg.guild.id,
            b: msg.channel.id
        }).then((geRow) => {

            let settings = {
                ID: geRow.EventID,
                Announcement_Channel_ID: geRow.Announcement_Channel_ID,
                Event_Role_ID: geRow.Event_Role_ID,
                Guild_ID: geRow.Guild_ID,
                guildID: geRow.ID,
                guild_Discord_ID: geRow.Discord_ID,
                Developer_ID: geRow.Developer_ID,
                dis_client: client
            }

            init(settings).then((res) => {
                resolve(res);
            })
        })
    })
}


var mainFunct = () => {
    this.scheduler = (settings) => {
        init(settings).then((res) => {
            scheduler();
            console.log(`Setup complete for ${client.user.tag} on G_ID : ${setting.guildID} & E_ID : ${setting.ID}`);
        })
    }


    this.messageHandler = (msg, dis_client) => {



        if (msg.content === '!best_sea_guild?') {
            msg.channel.send('The highest leveled player in SEA is in?...');
        }

        if (msg.content === '!worst_sea_guild?') {
            msg.channel.send('The lowest leveled player in SEA is -   \nnah the ones who lack a spine, even more so than the backbone of a fossilized snail.');
        }

        if (msg.content === '!best_castle?') {
            msg.channel.send('The castle of Sycria Underwater Ruins.');
        }

        if (msg.content === '!complaints') {
            msg.delete(delay);
            msg.channel.send('Don\'t like the RSVP Bot spam?\nhttps://youtu.be/ynMk2EwRi4Q');
        }

        if (msg.content === '!tell_time') {
            var datetime = (new Date()).toLocaleString();
            msg.delete(delay);
            msg.channel.send(datetime);
        }

        if (msg.content === '!rsvp_help') {
            specMessages(msg).then((res) => {
                checkAdminRights(msg).then((right) => {
                    if (right) {
                        var guide = "Tell current time : \n!tell_time" +
                            "\n2)Send Announcements : \n!send_announcements" +
                            "\n3)Send Reminder : \n!remind_members" +
                            "\n4)Warn Members : \n!warn_members" +
                            "\n5)Remind Vacationers : \n!send_vacation";
                        msg.delete(delay);
                        msg.channel.send(guide);
                    }
                })
            })
        }


        if (msg.content === '!send_announcements') {
            specMessages(msg).then((res) => {
                checkAdminRights(msg).then((right) => {
                    msg.delete(delay);
                    sendForms();
                })
            })
        }

        if (msg.content === '!remind_members') {
            specMessages(msg).then((res) => {
                checkAdminRights(msg).then((right) => {
                    get_attendance(msg);
                })
            })
        }

        if (msg.content === '!warn_members') {
            specMessages(msg).then((res) => {
                checkAdminRights(msg).then((right) => {
                    get_attendance(msg, 'warning');
                })
            })
        }

        if (msg.content === '!send_vacation') {

            specMessages(msg).then((res) => {
                checkAdminRights(msg).then((right) => {
                    get_non_attendance(msg);
                })
            })
        }

        if (msg.content === '!read_settings') {
            specMessages(msg).then((res) => {
                checkAdminRights(msg).then((right) => {
                    readSettings(settings_workSheet).then((ws) => {
                        msg.author.send("LINK : " + (ws[0] && ws[0].g_forms_link ? ws[0].g_forms_link : '') + "\n" +
                            "Updated : " + (ws[0] && ws[0].updated ? ws[0].updated : ''));
                        msg.delete(delay);
                    });
                })
            })
        }

        if (msg.content === '!check_attendance') {
            specMessages(msg).then((res) => {
                checkAdminRights(msg).then((right) => {
                    get_astray(msg);
                })
            })
        }

    }

    return this;
}

module.exports = mainFunct;