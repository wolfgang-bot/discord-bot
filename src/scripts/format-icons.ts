import glob from "glob-promise"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { makeRunnable, run } from "@m.moelter/task-runner"

const FORMAT_SIZE = 128

const ASSETS_DIR = path.join(__dirname, "..", "modules", "skill-roles", "assets")
const ICONS_RAW_DIR = path.join(ASSETS_DIR, "icons-raw")
const ICONS_DIR = path.join(ASSETS_DIR, "icons")

makeRunnable(async () => {
    await run(deleteIcons, "Delete icons")

    await run(formatImages, "Format images")
})()

async function deleteIcons() {
    const files = await fs.promises.readdir(ICONS_DIR)

    await Promise.all(files.map(filename => {
        return fs.promises.unlink(path.join(ICONS_DIR, filename))
    }))
}

async function formatImages() {
    const icons = await glob("*.svg", { cwd: ICONS_RAW_DIR })

    await Promise.all(icons.map(filename => {
        const newFilename = filename.replace(".svg", ".png")
        
        return sharp(path.join(ICONS_RAW_DIR, filename))
            .resize({ width: FORMAT_SIZE, height: FORMAT_SIZE })
            .png()
            .toFile(path.join(ICONS_DIR, newFilename))
    }))
}