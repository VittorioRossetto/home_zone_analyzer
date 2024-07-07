const Pool = require("pg").Pool;
const pool = new Pool({
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
host: "localhost",
port: process.env.DB_PORT,
database: "home_zone_analyzer"
});
module.exports = pool;