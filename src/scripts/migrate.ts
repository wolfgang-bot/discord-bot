import path from "path"
import { makeRunnable, run } from "@m.moelter/task-runner"
import database from "../database"
import migrate from "../database/migrations"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") })

const tables = process.argv.slice(2)
    .map(table => table.replace(/\r/, ""))

makeRunnable(async () => {
    await database.connect()

    for (let table of tables) {
        await run(() => migrate(database, table), `Migrate table: ${table}`)
    }
})()
