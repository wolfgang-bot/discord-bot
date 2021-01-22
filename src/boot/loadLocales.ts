import path from "path"
import fs from "fs"
import LocaleServiceProvider from "../services/LocaleServiceProvider"

const SRC_DIR = path.join(__dirname, "..")
const MODULES_DIR = path.join(SRC_DIR, "modules")

async function loadLocales() {
    function load(dir: string, scope: string): Promise<void> {
        return LocaleServiceProvider.loadLocales(path.join(dir, "locales"), scope)
    }
    
    const modules = await fs.promises.readdir(MODULES_DIR)

    await Promise.all(modules.map(moduleName => {
        return load(path.join(MODULES_DIR, moduleName), moduleName)
    }))
}

export default loadLocales