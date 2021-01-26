import glob from "glob-promise"
import path from "path"
import { Seeder } from "../index"

const extension = process.env.NODE_ENV === "development" ? ".ts" : ".js"

async function run() {
    // Get all seeders from seed directory
    const seeders: Seeder[] = (await glob("*" + extension, { cwd: __dirname }))
        .filter(filename => /[0-9]+\.\w+.\w+/.test(filename))
        .map(filename => require(path.join(__dirname, filename)).default)

    for (let seeder of seeders) {
        if (!seeder.run) {
            continue
        }

        await seeder.run()
    }
}

export default run