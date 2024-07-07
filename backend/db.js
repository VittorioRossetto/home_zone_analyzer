const Pool = require("pg").Pool;
const pool = new Pool({
user: "postgres",
password: "V!ttori0123",
host: "localhost",
port: "5432",
database: "home_zone_analyzer"
});
module.exports = pool;