var db = require('./db_helper');

db.configuration_all_rows.then((result) => {
    console.log('db_tester : ', result)
})