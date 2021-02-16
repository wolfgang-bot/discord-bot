import path from "path"
import cliProgress from "cli-progress"
import database from "../database"
import seed from "../database/seeders"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") })

const tables = process.argv.slice(2)
const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

;(async () => {
    await database.connect()

    for (let table of tables) {
        console.log(`Seed table: ${table}`)

        await seed(table, (event: any) => {
            if (event.type === "init") {
                progressBar.start(event.data, 0)
            } else if (event.type === "update") {
                progressBar.update(event.data)
            } else if (event.type === "stop") {
                progressBar.stop()
            }
        })
    }
})()