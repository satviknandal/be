const db = require('./db_helper');
var discord = require('./discord_bot_helper');
console.log(discord);
console.log(db);

var db_s = db();
console.log(db_s);

db_s.configuration_all_rows.then((result) => {
    console.log('db_tester : ', result)
})