const fs = require("fs")
const path = require("path")

const STORAGE_FILE = path.join(__dirname, "..", "storage.json")

class StorageFacade {
    static guild(guild) {
        return new StorageFacade(guild.id)
    }

    constructor(id) {
        this.id = id
    }

    async readStorage() {
        let storage

        try {
            storage = JSON.parse(await fs.promises.readFile(STORAGE_FILE, "utf-8"))
        } catch {
            storage = {}
        }

        if (!storage[this.id]) {
            storage[this.id] = {}
        }

        return storage
    }

    async writeStorage(storage) {
        return await fs.promises.writeFile(STORAGE_FILE, JSON.stringify(storage), "utf-8")
    }

    async setItem(key, value) {
        const storage = await this.readStorage()
        storage[this.id][key] = value
        await this.writeStorage(storage)
    }

    async getItem(key) {
        const storage = await this.readStorage()
        return storage[this.id][key]
    }

    async deleteItem(key) {
        const storage = await this.readStorage()
        delete storage[this.id][key]
        await this.writeStorage(storage)
    }
}

module.exports = StorageFacade