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
    run: (args: any[], callback: ProgressCallback) => Promise<void> | void
}

export default new Database(process.env.SQLITE_DB_PATH)
