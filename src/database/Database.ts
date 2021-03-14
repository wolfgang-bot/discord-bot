import fs from "fs"
import sqlite from "sqlite3"
import migrate from "./migrations"

sqlite.verbose()

class Database {
    db: sqlite.Database

    constructor(private path: string) {}

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

    get(query: string, config?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(query, config, (error, result) => {
                if (error) reject(error)
                else resolve(result)
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
