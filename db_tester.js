const db = require('./db_helper');
const discord = require('./discord_bot_integrated_helper');

var db_helper = db();

db_helper.guild_all_rows().then((guildRows) => {
    guildRows.forEach((gRow) => {
        db_helper.event_all_rows(gRow.ID).then((eventRows) => {
            console.log('eventRows' , eventRows);
            eventRows.forEach((eRow) => {
                let settings = { 
                    ...eRow,
                    guildID :  gRow.ID,
                    guild_Discord_ID : gRow.Discord_ID,
                    Developer_ID : gRow.Developer_ID,
                }
                if(gRow.ID == 3){
                    discord(settings);
                }
            })
        })
    })
})