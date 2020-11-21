const glob = require("glob-promise")
const path = require("path")

async function run(database) {
    const migrations = await glob("*.js", { cwd: __dirname })
        .filter(filename => /[0-9]+\.\w+.\w+/.test(filename))
        .map(filename => require(path.join(__dirname, filename)))

    for (let migration of migrations) {
        if (!migration.columns) {
            continue
        }

        const query = `
            CREATE TABLE ${migration.table} (
                ${migration.columns.join(",\n")}
            );
        `

        await database.run(query)
    }
}

module.exports = run