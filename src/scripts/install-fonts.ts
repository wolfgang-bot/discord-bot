import fs from "fs"
import path from "path"
import util from "util"
import chalk from "chalk"
import log from "loglevel"
import child_process from "child_process"
import { makeRunnable, run } from "@m.moelter/task-runner"

const exec = util.promisify(child_process.exec)

const FONTS_DIR = path.join(__dirname, "..", "assets", "fonts")
const SYSTEM_FONTS_DIR = "/usr/share/fonts/truetype"

const installed = []
const failed = []

makeRunnable(async () => {
    await run(installFonts, "Install fonts")

    await run(() => exec("fc-cache -f -v"), "Update font cache")

    if (installed.length > 0) {
        log.info(chalk.green(`Successfully installed: ${installed.join(", ")}`))
    }

    if (failed.length > 0) {
        log.info(chalk.red(`Failed to install: ${failed.join(", ")}`))
    }
})()

async function installFonts() {
    const fonts = await fs.promises.readdir(FONTS_DIR)

    await Promise.all(fonts.map(async font => {
        if (!await hasFont(font)) {
            await copyFolder(path.join(FONTS_DIR, font), path.join(SYSTEM_FONTS_DIR, font))
            
            if (!await hasFont(font)) {
                failed.push(font)
            } else {
                installed.push(font)
            }
        }
    }))
}

async function copyFolder(src: string, dest: string) {
    await exec(`mkdir -p ${dest}`)
    await exec(`cp -r ${src}/* ${dest}`)
}

async function hasFont(font: string) {
    const { stdout: installedFonts, stderr } = await exec("fc-list")

    if (stderr) {
        throw new Error(stderr)
    }

    return new RegExp(`/${font}/`).test(installedFonts)
}
