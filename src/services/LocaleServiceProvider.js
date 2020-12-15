const path = require("path")
const fs = require("fs")
const glob = require("glob-promise")
const yaml = require("yaml")
const Guild = require("../models/Guild.js")

class LocaleServiceProvider {
    static defaultLocale = "en"
    static defaultScope = "main"

    /**
     * Translations are encapsulated into scopes
     */
    static scopes = {
        [LocaleServiceProvider.defaultScope]: {}    
    }

    /**
     * Load locale files into LocaleServiceProvider.locales
     * 
     * @param {String} dir
     * @param {String} scope
     */
    static async loadLocales(dir, scope) {
        const files = await glob("*.yml", { cwd: dir })

        // Check for existence of default locale
        if (!files.some(filename => filename.startsWith(LocaleServiceProvider.defaultLocale))) {
            throw new Error(`Missing required locale '${LocaleServiceProvider.defaultLocale}'`)
        }

        await Promise.all(files.map(async filename => {
            // Load yaml file
            const localeCode = filename.replace(".yml", "")
            const content = await fs.promises.readFile(path.join(dir, filename), "utf-8")
            const locales = yaml.parse(content)
            
            LocaleServiceProvider.addLocales(localeCode, locales, scope)
        }))
    }

    /**
     * Add locales to the locale object of a given scope
     * 
     * @param {String} localeCode 
     * @param {Object} locales 
     * @param {String} scope
     */
    static addLocales(localeCode, locales, scope = LocaleServiceProvider.defaultScope) {
        if (!LocaleServiceProvider.scopes[scope]) {
            LocaleServiceProvider.scopes[scope] = {}
        }

        if (!LocaleServiceProvider.scopes[scope][localeCode]) {
            LocaleServiceProvider.scopes[scope][localeCode] = {}
        }

        // Check for duplicate keys
        for (let key in locales) {
            if (key in LocaleServiceProvider.scopes[scope][localeCode]) {
                throw new Error(`Key '${key}' already exists`)
            }
        }

        Object.assign(LocaleServiceProvider.scopes[scope][localeCode], locales)
    }

    /**
     * Create an instance of this class which uses the guild's language defined in the database.
     * 
     * @param {Discord.Guild} guild
     * @returns {LocaleServiceProvider}
     */
    static async guild(guild) {
        const model = await Guild.findBy("id", guild.id)

        if (!model) {
            console.trace(`Guild '${guild.id}' - '${guild.name}' ist not available`)
            return new LocaleServiceProvider(LocaleServiceProvider.defaultLocale)
        }

        return new LocaleServiceProvider(model.locale)
    }

    constructor(locale, scope = LocaleServiceProvider.defaultScope) {
        this.locale = locale
        this.scopeName = scope

        // Name has to have the underscore, since "scope" is used for method chaining
        this._scope = LocaleServiceProvider.scopes[this.scopeName]
        
        if (!this._scope) {
            throw new Error(`Scope '${this.scopeName}' does not exist`)
        }

        this.translations = this._scope[locale]

        if (!this.translations) {
            throw new Error(`Locale '${locale}' does not exist in scope '${this.scopeName}'`)
        }
    }

    /**
     * Create a new instance of this class with a new scope
     * 
     * @param {String} scope
     * @returns {LocaleServiceProvider}
     */
    scope(scope) {
        return new LocaleServiceProvider(this.locale, scope)
    }

    /**
     * Get the translation of a key by looking into the language specific translation file.
     * 
     * @param {String} key
     * @param {...String} args
     * @returns {String} Translation
     */
    translate(key, ...args) {
        let value = this.translations[key]
        
        // Fallback to default locale
        if (!value) {
            value = this._scope[LocaleServiceProvider.defaultLocale][key]
        }

        if (!value) {
            throw new Error(`Key '${key}' does not exist in scope '${this.scopeName}'`)
        }

        /**
         * Replace placeholders with variables
         * {0} -> args[0], {1} -> args[1], ...
         */
        const insertArgs = (value) => {
            return args.reduce((value, arg, i) => {
                return value.replace(new RegExp(`\\{${i}\\}`, "g"), arg)
            }, value)
        }

        if (value.constructor.name === "Array") {
            // Insert arguments into every translation in the "value" array
            for (let i = 0; i < value.length; i++) {
                value[i] = insertArgs(value[i])
            }
        } else {
            // Insert arguments into the translation
            value = insertArgs(value)
        }

        return value
    }
}

module.exports = LocaleServiceProvider