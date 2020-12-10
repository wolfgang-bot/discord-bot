const path = require("path")
const glob = require("glob-promise")
const LocaleServiceProvider = require("../services/LocaleServiceProvider.js")

const APP_DIR = path.join(__dirname, "..")
const ASSETS_DIR = path.join(APP_DIR, "assets")
const MODULES_DIR = path.join(APP_DIR, "modules")

// Directories from which "/locales" sub-directories will be loaded recursively
const dirs = [
    ASSETS_DIR,
    MODULES_DIR
]

async function loadLocales() {
    const paths = await Promise.all(dirs.map(async dir => {
        const paths = await glob("**/locales", { cwd: dir })
        return paths.map(localesPath => path.join(dir, localesPath))
    }))

    await Promise.all(paths.flat().map(LocaleServiceProvider.loadLocales))
}

module.exports = loadLocales