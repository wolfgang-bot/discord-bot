import glob from "glob-promise"
import path from "path"
import { Seeder } from "../index"

async function run(
    table?: string,
    callback?: (event: any) => void
) {
    let seeders: Seeder[] = (await glob("*.ts", { cwd: __dirname }))
        .filter(filename => /[0-9]+\.\w+.\w+/.test(filename))
        .map(filename => require(path.join(__dirname, filename)).default)

    if (table) {
        seeders = seeders.filter(migration => migration.table === table)

        if (seeders.length === 0) {
            throw new Error(`Seeder for table '${table}' does not exist`)
        }
    }

    for (let seeder of seeders) {
        if (!seeder.run) {
            continue
        }

        await seeder.run(callback)
    }
}

export default run