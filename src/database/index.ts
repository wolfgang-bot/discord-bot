import path from "path"
import Database from "./Database"

export type Migration = {
    table: string
    columns: string[]
}

export type Seeder = {
    table: string
    run: (
        callback: (event: {
            type: "init" | "update" | "stop",
            data: number
        }) => void
    ) => Promise<void> | void
}

const DATABASE_PATH = path.join(__dirname, "db.sqlite3")

export default new Database(DATABASE_PATH)