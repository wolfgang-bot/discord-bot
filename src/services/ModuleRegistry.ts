import glob from "glob-promise"
import path from "path"
import Discord from "discord.js"
import Module from "../lib/Module"
import Collection from "../lib/Collection"
import Configuration from "../lib/Configuration"
import ModuleModel from "../models/Module"
import LocaleProvider from "./LocaleProvider"
import defaultConfig from "../config/default"
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

            if (!module.isGlobal) {
                ModuleRegistry.addModuleConfigToDefaultConfig(module)
            }
        }))
    }

    /**
     * Add a module's guild configuration to the default config
     */
    static addModuleConfigToDefaultConfig(module: typeof Module) {
        try {
            const moduleConfig = require(
                path.join(MODULES_DIR, module.key, "models", "Configuration.ts")
            ).default as typeof Configuration
            
            defaultConfig.value[module.key] = moduleConfig.guildConfig
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            throw new Error(`Failed to load config from module '${module.key}'`)
        }
    }

    /**
     * Get a module class from a database model
     */
    static getModule(model: ModuleModel) {
        return ModuleRegistry.modules.find(module => module.key === model.key)
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
     * Fill a module's translation map
     */
    static translate(module: typeof Module) {
        const moduleLocale = new LocaleProvider().scope(module.key)

        module.translations = {
            desc: moduleLocale.translate(module.desc),

            features: moduleLocale.translateArray(module.features),
            
            args: module.args.map(arg => {
                const newArg = arg.clone()

                newArg.key = moduleLocale.translate(arg.key)
                newArg.name = moduleLocale.translate(arg.name)
                newArg.desc = moduleLocale.translate(arg.desc)

                return newArg
            })
        }
    }
}

export default ModuleRegistry