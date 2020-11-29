const BaseEmbed = require("./BaseEmbed.js")
const { capitalCase } = require("change-case")

class ModuleConfigEmbed extends BaseEmbed {
    constructor(config, moduleName, moduleConfig) {
        super(config)
        
        this.setTitle(`Configuration for: ${moduleName}`)

        Object.entries(moduleConfig).forEach(([key, { description, value }]) => {
            const capitalKey = capitalCase(key)

            this.addField(capitalKey, `
                *Key: ${key}
                ${description}*
                \`\`\`\n${Array.isArray(value) ? value.join("\n") : value}\`\`\`
            `)
        })
    }
}

module.exports = ModuleConfigEmbed