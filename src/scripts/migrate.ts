import path from "path"
import { makeRunnable, run } from "@m.moelter/task-runner"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") })
import database from "../database"
import migrate from "../database/migrations"

const tables = process.argv.slice(2)
    .map(table => table.replace(/\r/, ""))

makeRunnable(async () => {
    await database.connect()

    if (tables.length !== 0) {
        for (let table of tables) {
            await run(() => migrate(database, table), `Migrate table: ${table}`)
        }
    } else {
        await run(() => migrate(database), 'Migrate database')
    }

    database.disconnect()
})()
