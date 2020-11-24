const path = require("path")
const { makeRunnable, run } = require("@m.moelter/task-runner")
const database = require("../app/database")
const migrate = require("../app/database/migrations")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const tables = process.argv.slice(2)

makeRunnable(async () => {
    await database.connect()

    for (let table of tables) {
        await run(() => migrate(database, table), `Migrate table: ${table}`)
    }
})()