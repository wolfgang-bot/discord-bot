const fs = require("fs")
const path = require("path")

const STORAGE_FILE = path.join(__dirname, "..", "storage.json")

class StorageFacade {
    static async readStorage() {
        try {
            return JSON.parse(await fs.promises.readFile(STORAGE_FILE, "utf-8"))
        } catch {
            return {}
        }
    }

    static async writeStorage(storage) {
        return await fs.promises.writeFile(STORAGE_FILE, JSON.stringify(storage), "utf-8")
    }

    static async setItem(key, value) {
        const storage = await StorageFacade.readStorage()
        storage[key] = value
        await StorageFacade.writeStorage(storage)
    }

    static async getItem(key) {
        const storage = await StorageFacade.readStorage()
        return storage[key]
    }
}

module.exports = StorageFacade