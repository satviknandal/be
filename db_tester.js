const db = require('./db_helper');
const discord = require('./discord_bot_integrated_helper');
const Discord = require('discord.js');

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
                    me : gRow.Developer_ID,
                }
                
                discord(settings);
            })
        })
    })
})