const glob = require("glob-promise")
const path = require("path")

async function run(database, table) {
    let migrations = (await glob("*.js", { cwd: __dirname }))
        .filter(filename => /[0-9]+\.\w+.\w+/.test(filename))
        .map(filename => require(path.join(__dirname, filename)))

    if (table) {
        migrations = migrations.filter(migration => migration.table === table)

        if (migrations.length === 0) {
            throw new Error(`Migration for table '${table}' does not exist`)
        }
    }

    for (let migration of migrations.reverse()) {
        await database.run(`DROP TABLE IF EXISTS '${migration.table}'`)
    }

    for (let migration of migrations) {
        const query = `
            CREATE TABLE ${migration.table} (
                ${migration.columns.join(",\n")}
            );
        `

        await database.run(query)
    }
}

module.exports = run