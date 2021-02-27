import fs from "fs"
import sqlite from "sqlite3"
import migrate from "./migrations"

sqlite.verbose()

class Database {
    path: string
    db: sqlite.Database

    constructor(path: string) {
        this.path = path
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            let fileExists = fs.existsSync(this.path)

            this.db = new sqlite.Database(this.path, async (error) => {
                if (error) return reject()

                if (!fileExists) {
                    await migrate(this)
                }

                resolve()
            })
        })
    }

    run(query: string, config?: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(query, config, (error) => {
                if (error) reject(error)
                else resolve()
            })
        })
    }

    all(query: string, config?: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(query, config, (error, results) => {
                if (error) reject(error)
                else resolve(results)
            })
        })
    }
}

export default Database
