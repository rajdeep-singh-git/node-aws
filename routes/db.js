const mysql = require("mysql2");

const conn = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'test',
});

module.exports = conn