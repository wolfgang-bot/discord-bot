const fs = require("fs-extra")
const path = require("path")
const glob = require("glob-promise")
const { makeRunnable, run } = require("@m.moelter/task-runner")

const name = process.argv[2]

if (!name) {
    throw new Error("Missing name")
}

const APP_DIR = path.join(__dirname, "..", "app")
const TEMPLATE_DIR = path.join(APP_DIR, "assets", "templates", "module")
const NEW_DIR = path.join(APP_DIR, "modules", name)
const CONFIG_PATH = path.join(APP_DIR, "config", "default.js")

const CONFIG_TEMPLATE = `
    "{MODULE_NAME}": {
        value: {
            property: {
                description: "Enter description",
                value: "Enter default value"
            }
        }
    },`

makeRunnable(async () => {
    await run(async () => {
        /**
         * Copy template into modules directory
         */
        await fs.copy(TEMPLATE_DIR, NEW_DIR)

        /**
         * Insert module name into files
         */
        const files = await glob("**/*.*", { cwd: NEW_DIR })

        await Promise.all(files.map(async (filepath) => {
            filepath = path.join(NEW_DIR, filepath)

            let content = await fs.readFile(filepath, "utf-8")
            content = content.replace(/{MODULE_NAME}/g, name)
            await fs.writeFile(filepath, content)
        }))

        /**
         * Add entry to default configuration
         */
        let config = await fs.readFile(CONFIG_PATH, "utf-8")
        const lines = await config.split("\n")
        const index = lines.lastIndexOf("}")

        lines.splice(index, 0, CONFIG_TEMPLATE.replace(/{MODULE_NAME}/g, name))

        await fs.writeFile(CONFIG_PATH, lines.join("\n"))

    }, `Create module '${name}'`)
})()