const fs = require("fs")
const sqlite = require("sqlite3").verbose()

const migrate = require("./migrations")
const seed = require("./seeders")

class Database {
    constructor(path) {
        this.path = path

        this.db = null
    }

    connect() {
        return new Promise((resolve, reject) => {
            let fileExists = false

            if (fs.existsSync(this.path)) {
                fileExists = true
            }

            this.db = new sqlite.Database(this.path, async (error) => {
                if (error) return reject()

                if (!fileExists) {
                    await migrate(this.db)

                    if (process.env.NODE_ENV === "development") {
                        await seed()
                    }
                }

                resolve()
            })
        })
    }

    run(query, config) {
        return new Promise((resolve, reject) => {
            this.db.run(query, config, (error) => {
                if (error) reject(error)
                else resolve()
            })
        })
    }

    all(query, config) {
        return new Promise((resolve, reject) => {
            this.db.all(query, config, (error, results) => {
                if (error) reject(error)
                else resolve(results)
            })
        })
    }
}

module.exports = Database