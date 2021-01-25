import path from "path"
import fs from "fs"
import glob from "glob-promise"
import yaml from "yaml"
import * as Discord from "discord.js"
import Guild from "../models/Guild"

type ScopeMap = {
    [scope: string]: LocaleMap
}

type LocaleMap = {
    [locale: string]: TranslationMap
}

type TranslationMap = {
    [key: string]: string | string[]
}

class LocaleServiceProvider {
    static defaultLocale = "en"
    static defaultScope = "main"

    locale: string
    scopeName: string
    _scope: LocaleMap
    translations: TranslationMap

    /**
     * Translations are encapsulated into scopes.
     * A scope can be the default scope or a module name.
     */
    static scopes: ScopeMap = {
        [LocaleServiceProvider.defaultScope]: {}
    }

    /**
     * Load translation files
     */
    static async loadLocales(dir: string, scope: string) {
        const files = await glob("*.yml", { cwd: dir })

        // Check for existence of default locale
        if (!files.some(filename => filename.startsWith(LocaleServiceProvider.defaultLocale))) {
            throw new Error(`Missing default locale '${LocaleServiceProvider.defaultLocale}'`)
        }

        await Promise.all(files.map(async filename => {
            // Load yaml file
            const localeCode = filename.replace(".yml", "")
            const content = await fs.promises.readFile(path.join(dir, filename), "utf-8")
            const locales: TranslationMap = yaml.parse(content)
            
            LocaleServiceProvider.addTranslations(localeCode, locales, scope)
        }))
    }

    /**
     * Add locales to a given scope
     */
    static addTranslations(localeCode: string, locales: TranslationMap, scope: string = LocaleServiceProvider.defaultScope) {
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
     * Create an instance of this class which uses the guild's language stored in the database
     */
    static async guild(guild: Discord.Guild) {
        const model = await Guild.findBy("id", guild.id) as Guild

        if (!model) {
            console.trace(`Guild '${guild.id}' - '${guild.name}' ist not available`)
            return new LocaleServiceProvider(LocaleServiceProvider.defaultLocale)
        }

        return new LocaleServiceProvider(model.locale)
    }

    constructor(
        locale: string = LocaleServiceProvider.defaultLocale,
        scope: string = LocaleServiceProvider.defaultScope
    ) {
        this.locale = locale
        this.scopeName = scope

        // Name has to have the underscore since "scope" is used for method chaining
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
     */
    scope(scope: string) {
        return new LocaleServiceProvider(this.locale, scope)
    }

    /**
     * Get the translation of a key by looking into the language specific translations
     */
    private translateAnyType(key: string, ...args: string[]) {
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
         * "{0}" -> args[0], "{1}" -> args[1], ...
         */
        const insertArgs = (value: string) => {
            return args.reduce((value, arg, i) => {
                return value.replace(new RegExp(`\\{${i}\\}`, "g"), arg)
            }, value)
        }

        if (value.constructor.name === "Array") {
            // Insert arguments into every translation in the "value" array
            for (let i = 0; i < value.length; i++) {
                (value as string[])[i] = insertArgs(value[i])
            }
        } else {
            // Insert arguments into the translation
            value = insertArgs(value as string)
        }

        return value
    }

    translate(...args: Parameters<LocaleServiceProvider["translateAnyType"]>) {
        return this.translateAnyType(...args) as string
    }

    translateArray(...args: Parameters<LocaleServiceProvider["translateAnyType"]>) {
        return this.translateAnyType(...args) as string[]
    }
}

export default LocaleServiceProvider