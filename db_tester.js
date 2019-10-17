const db = require('./db_helper');
const discord = require('./discord_bot_helper');
console.log('discord', discord);
console.log('db', db);

db().configuration_all_rows().then((result) => {
    console.log('db_tester : ', result)
})