const path = require("path")
const Database = require("./Database.js")

const DATABASE_PATH = path.join(__dirname, "db.sqlite3")

module.exports = new Database(DATABASE_PATH)