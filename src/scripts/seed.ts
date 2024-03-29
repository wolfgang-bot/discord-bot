import path from "path"
import MultiProgress from "multi-progress"
import type ProgressBar from "progress"
import chalk from "chalk"
import { performance } from "perf_hooks"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") })
import log from "loglevel"
import database from "../database"
import seed from "../database/seeders"

const table = process.argv[2]?.replace(/\r/, "")
const args = process.argv.slice(3)

const multiProgress = new MultiProgress()
const bars: Record<string, ProgressBar> = {}

function createProgressBar(label: string, length: number) {
    label = label.padEnd(8, " ")

    return multiProgress.newBar(
        `${label} [:bar] :percent | :etas | :current/:total | :rate/s`,
        {
            total: length,
            width: 50,
            complete: "=",
            incomplete: " "
        }
    )
}

;(async () => {
    const t0 = performance.now()

    await database.connect()

    log.info(`Seed table: ${table}`)

    await seed(table, args, (event: any) => {
        if (event.type === "init") {
            bars[event.key] = createProgressBar(event.key, event.data)
        } else if (event.type === "tick") {
            bars[event.key].tick()
        }
    })

    let elapsed = (performance.now() - t0)
    elapsed = Math.floor(elapsed * 100) / 100
    elapsed /= 1000
    log.info(chalk.cyan(`Executed in ${elapsed}s`))
    
    database.disconnect()
})()
