import glob from "glob-promise"
import path from "path"
import Database from "../Database"
import { Migration } from "../index"

async function run(database: Database, table?: string) {
    let migrations: Migration[] = (await glob("*.ts", { cwd: __dirname }))
        .filter(filename => /[0-9]+\.\w+.\w+/.test(filename))
        .map(filename => require(path.join(__dirname, filename)).default)

    if (table) {
        migrations = migrations.filter(migration => migration.table === table)

        if (migrations.length === 0) {
            throw new Error(`Migration for table '${table}' does not exist`)
        }
    }

    for (let migration of migrations.reverse()) {
        await database.query(`DROP TABLE IF EXISTS ${migration.table}`)
    }

    for (let migration of migrations) {
        await database.query(`
            CREATE TABLE ${migration.table} (
                ${migration.columns.join(",\n")}
            );
        `)

        // Convert charset for storing emojis
        await database.query(`
            ALTER TABLE ${migration.table}
            CONVERT TO CHARACTER SET utf8mb4
            COLLATE utf8mb4_bin;
        `)
    }
}

export default run
