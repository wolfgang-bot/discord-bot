const glob = require("glob")
const path = require("path")

async function run() {
    // Get all seeders from seed directory
    const seeders = glob.sync("*.js", { cwd: __dirname })
        .filter(filename => /[0-9]+\.\w+.\w+/.test(filename))
        .map(filename => require(path.join(__dirname, filename)))

    for (let seeder of seeders) {
        if (!seeder.run) {
            continue
        }

        await seeder.run()
    }
}

module.exports = run