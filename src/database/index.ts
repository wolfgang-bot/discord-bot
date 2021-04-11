import Database from "./Database"

export type ProgressCallback = (event: {
    type: "init" | "tick",
    key: string,
    data?: number
}) => void

export type Migration = {
    table: string,
    columns: string[]
}

export type Seeder = {
    table: string,
    run: (callback: ProgressCallback) => Promise<void> | void
}

const DEFAULT_PATH = "/etc/discord-bot/db.sqlite3"
const DATABASE_PATH = process.env.SQLITE_DB_PATH || DEFAULT_PATH

export default new Database(DATABASE_PATH)
