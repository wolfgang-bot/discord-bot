import path from "path"
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

const DATABASE_PATH = path.join(__dirname, "db.sqlite3")

export default new Database(DATABASE_PATH)