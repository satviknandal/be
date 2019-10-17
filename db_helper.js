const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('../discord_db/discord_bot_siege_db');

let sql = "SELECT * FROM Configuration";

// first row only
db.get(sql, [], (err, row) => {
    if (err) {
        return console.error(err.message);
    }
    console.log(row);
    return row
        ? console.log(row.id, row.name)
        : console.log(`no config found!`);

});

db.all(sql, [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log(rows);
    rows.forEach((row) => {
        console.log(row.name);
    });
});


// // close the database connection
// db.close((err) => {
//     if (err) {
//         return console.error(err.message);
//     }
//     console.log('Close the database connection.');
// });