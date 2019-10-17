const db = require('./db_helper');

console.log(db);

var db_s = db();
console.log(db_s);

db_s.configuration_all_rows.then((result) => {
    console.log('db_tester : ', result)
})