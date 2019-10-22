const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('../discord_db/discord_bot_siege_db');

let first_Row = (sql, param) => {
    return new Promise(function (resolve, reject) {
        console.log(sql, param);
        // first row only
        db.get(sql, param ? param : [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            resolve(row);
            return row
                ? console.log(row.ID, row.Sheet)
                : console.log(`no config found!`);
        });
    });
}

let all_rows = (sql, param) => {
    console.log(sql, param);
    return new Promise(function (resolve, reject) {
        // first row only
        db.all(sql, param ? param : [], (err, rows) => {
            if (err) {
                throw err;
            }

            rows.forEach((row) => {
                console.log(row.ID);
            });

            resolve(rows);
        });
    });
}

var guild_a_r = () => {
    return all_rows(`SELECT * FROM Guild`);
}

var event_a_r = (param) => {
    return all_rows(`SELECT * FROM Event WHERE Guild_ID = ?`, [param]);
}

var schedule_a_r = (param) => {
    return all_rows(`SELECT * FROM Schedule WHERE Event_ID = ?`, [param]);
}

var permissions_a_r = (param) => {
    return all_rows(`SELECT * FROM Permissions WHERE Event_ID = ?`, [param]);
}

var configuration_a_r = (param) => {
    return all_rows(`SELECT * FROM Configuration WHERE Event_ID = ?`, [param]);
}

var configuration_f_r = (param) => {
    return first_Row(`SELECT * FROM Configuration WHERE Event_ID = ?`, [param]);
}


var guild_event_f_r = (param) => {
    return first_Row(`SELECT g.*, e.*, e.ID as 'EventID' FROM Guild g LEFT JOIN Event e ON g.ID = e.Guild_ID`, [param.a, param.b]);
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

    this.guild_all_rows = () => guild_a_r();
    this.event_all_rows = (param) => event_a_r(param);
    this.schedule_all_rows = (param) => schedule_a_r(param);
    this.permissions_all_rows = (param) => permissions_a_r(param);
    this.configuration_all_rows = (param) => configuration_a_r(param);
    this.configuration_first_row = (param) => configuration_f_r(param);
    this.guild_event_first_row = (param) => guild_event_f_r(param);

    return this;
}

module.exports = mainFunct;