const fs = require("fs")
const path = require("path")
const BaseEmbed = require("../../Embeds/BaseEmbed.js")

const CONTENT_DIR = path.join(__dirname, "content")

const content = {
    ask: fs.readFileSync(path.join(CONTENT_DIR, "ask.md")),
    format: fs.readFileSync(path.join(CONTENT_DIR, "format.md")),
    howToAskAQuestion: fs.readFileSync(path.join(CONTENT_DIR, "how-to-ask-a-question.md"))
}

class HelpEmbed extends BaseEmbed {
    constructor() {
        super()

        this.setTitle("Fragen-Kanäle")
            .addField("Frage stellen", content.ask)
            .addField("Format", content.format)
            .addField("Wie stelle ich eine Frage", content.howToAskAQuestion)
    }
}

module.exports = HelpEmbed