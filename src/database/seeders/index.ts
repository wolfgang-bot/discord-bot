import glob from "glob-promise"
import path from "path"
import { Seeder } from "../index"

async function run() {
    // Get all seeders from seed directory
    const seeders: Seeder[] = (await glob("*.js", { cwd: __dirname }))
        .filter(filename => /[0-9]+\.\w+.\w+/.test(filename))
        .map(filename => require(path.join(__dirname, filename)))

    for (let seeder of seeders) {
        if (!seeder.run) {
            continue
        }

        await seeder.run()
    }
}

export default run