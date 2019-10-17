const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('../discord_db/discord_bot_siege_db');

let first_Row = (sql) => {
    return new Promise(function (resolve, reject) {
        // first row only
        db.get(sql, [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            console.log(row);
            resolve(row);
            return row
                ? console.log(row.ID, row.Sheet)
                : console.log(`no config found!`);
        });
    });
}

let all_rows = (sql) => {
    return new Promise(function (resolve, reject) {
        // first row only
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            console.log(rows);
            resolve(rows);
            rows.forEach((row) => {
                console.log(row.ID);
            });
        });
    });
}

var configuration_f_r = () => {
    return first_Row(`SELECT * FROM Configuration`);
}

var configuration_a_r = () => {
    return all_rows(`SELECT * FROM Configuration`);
}


let close_db = () => {

    // close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });

}

var mainFunct = (res) => {

    let configuration_all_rows = configuration_a_r();

    let configuration_first_row = configuration_f_r();
}

module.exports = mainFunct;