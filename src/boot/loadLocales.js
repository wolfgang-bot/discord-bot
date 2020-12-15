const path = require("path")
const glob = require("glob-promise")
const fs = require("fs")
const LocaleServiceProvider = require("../services/LocaleServiceProvider.js")

const SRC_DIR = path.join(__dirname, "..")
const MODULES_DIR = path.join(SRC_DIR, "modules")

async function loadLocales() {
    function load(dir, scope) {
        return LocaleServiceProvider.loadLocales(path.join(dir, "locales"), scope)
    }
    
    const modules = await fs.promises.readdir(MODULES_DIR)

    await Promise.all(modules.map(moduleName => {
        return load(path.join(MODULES_DIR, moduleName), moduleName)
    }))
}

module.exports = loadLocales