import glob from "glob-promise"
import path from "path"
import fs from "fs"
import Discord from "discord.js"
import Module from "../lib/Module"
import Collection from "../lib/Collection"
import ModuleModel from "../models/Module"
import ModuleInstanceRegistry from "./ModuleInstanceRegistry"

const MODULES_DIR = path.join(__dirname, "..", "modules")

class ModuleRegistry {
    static modules: (typeof Module)[] = []

    /**
     * Initialize module registry
     */
    static async boot(client: Discord.Client) {
        ModuleInstanceRegistry.moduleRegistry = this
        
        await ModuleRegistry.loadModules()
        await ModuleRegistry.loadModulesToDB()
        await ModuleInstanceRegistry.restoreInstances(client)
    }

    /**
     * Load modules from all "src/modules/../index" files
     */
    static async loadModules() {
        const files = await glob("?*/", { cwd: MODULES_DIR })

        await Promise.all(files.map(async filepath => {
            const module = require(
                path.join(MODULES_DIR, filepath, "index")
            ).default as typeof Module

            ModuleRegistry.modules.push(module)
        }))

        this.sortModules()
    }

    /**
     * Sort modules by position property
     */
    static sortModules() {
        this.modules.sort((a, b) =>
            (a.position || this.modules.length) - (b.position || this.modules.length)
        )
    }

    /**
     * Check if a module is protected
     */
    static isProtectedModule(module: typeof Module, opts: { includeStatic?: boolean } = {}) {
        const newOpts = { includeStatic: false, ...opts }
        return module.isGlobal || module.isPrivate || (!newOpts.includeStatic && module.isStatic)
    }

    /**
     * Get modules that are not protected
     */
    static getPublicModules(opts?: { includeStatic?: boolean }) {
        return this.modules.filter(module => !this.isProtectedModule(module, opts))
    }

    /**
     * Get a module class from a database model
     */
    static getModule(moduleKey: ModuleModel | string) {
        if (moduleKey instanceof ModuleModel) {
            moduleKey = moduleKey.key
        }
        return ModuleRegistry.modules.find(module => module.key === moduleKey)
    }

    /**
     * Load missing modules into database
     */
    static async loadModulesToDB() {
        const models = await ModuleModel.getAll() as Collection<ModuleModel>

        await Promise.all(ModuleRegistry.modules.map(async module => {
            const isInDatabase = models.some(model => model.key === module.key)

            if (!isInDatabase) {
                const model = new ModuleModel({
                    key: module.key
                })
                await model.store()
            }
        }))
    }

    /**
     * Get all commands from all modules combined
     */
    static getAllCommands() {
        return this.modules
            .map(module => module.createCommands())
            .flat()
    }

    /**
     * Get the filenames of a module's images
     */
    static findModuleImages(module: typeof Module) {
        const imagesDir = path.join(MODULES_DIR, module.key, "images")
        if (!fs.existsSync(imagesDir)) {
            return []
        }
        return fs.readdirSync(imagesDir)
            .map((imagePath) => path.basename(imagePath))
    }
}

export default ModuleRegistry
