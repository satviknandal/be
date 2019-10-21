const db = require('./db_helper');
const discord = require('./discord_bot_helper');
console.log('discord', discord);
console.log('db', db);

var db_helper = db();

db_helper.guild_all_rows().then((guildRows) => {
    guildRows.forEach((gRow) => {
        db_helper.event_all_rows(gRow.ID).then((eventRows) => {
            console.log(eventRows);
            eventRows.forEach((eRow) => {




            })
        })
    })
})





// guildID = settings.guild_ID;
// channelID = settings.channel_ID;
// siegeMemberRoleNumber = settings.siegeMember_ID;
// siegeMember = "<@" + settings.siegeMember_ID + ">";
// sheet = settings.sheet;
// workSheet = settings.workSheet;
// me = developer;