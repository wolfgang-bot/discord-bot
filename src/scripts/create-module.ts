import fs from "fs-extra"
import path from "path"
import glob from "glob-promise"
import { makeRunnable, run } from "@m.moelter/task-runner"

const key = process.argv[2]

if (!key) {
    throw new Error("Missing key")
}

const SRC_DIR = path.join(__dirname, "..")
const TEMPLATE_DIR = path.join(SRC_DIR, "assets", "templates", "module")
const NEW_DIR = path.join(SRC_DIR, "modules", key)

makeRunnable(async () => {
    await run(async () => {
        /**
         * Copy template into modules directory
         */
        await fs.copy(TEMPLATE_DIR, NEW_DIR)

        /**
         * Insert module key into files
         */
        const files = await glob("**/*.*", { cwd: NEW_DIR })

        await Promise.all(files.map(async (filepath) => {
            filepath = path.join(NEW_DIR, filepath)

            let content = await fs.readFile(filepath, "utf-8")
            content = content.replace(/{MODULE_KEY}/g, key)
            await fs.writeFile(filepath, content)
        }))
    }, `Create module '${key}'`)
})()