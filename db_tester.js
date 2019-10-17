var db = require('./db_helper');


var db_s = new db();
console.log(db_s);

db_s.configuration_all_rows.then((result) => {
    console.log('db_tester : ', result)
})