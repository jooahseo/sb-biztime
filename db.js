/** Database setup for BizTime. */

const { Client } = require('pg')

let DATABASE_URI;

if(process.env.NODE_ENV === "test"){
    DATABASE_URI = "postgresql:///biztime_test"
}else{
    DATABASE_URI = "postgresql:///biztime"
}

let db = new Client({
    connectionString: DATABASE_URI
})

db.connect();

module.exports = db;