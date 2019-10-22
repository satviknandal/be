const db = require('./db_helper');
var atob = require('atob');
const discord = require('./discord_bot_integrated_helper');
const Discord = require('discord.js');
var auth = require('./auth.json');
let client = new Discord.Client();

var db_helper = db();

db_helper.guild_all_rows().then((guildRows) => {
    guildRows.forEach(async (gRow) => {
        let eventRows = await db_helper.event_all_rows(gRow.ID);
        eventRows.forEach(async (eRow) => {
            let settings = {
                ...eRow,
                guildID: gRow.ID,
                guild_Discord_ID: gRow.Discord_ID,
                Developer_ID: gRow.Developer_ID,
                dis_client: client
            }

            let rtn_client = await discord(settings);
            client = rtn_client;
        })
    })

    client.login(atob(auth.token));
    console.log('???');
})