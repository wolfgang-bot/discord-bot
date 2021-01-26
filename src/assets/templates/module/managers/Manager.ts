import Manager from "../../../lib/Manger"
import Guild from "../../../models/Guild"

export default class MyManager extends Manager {
    async init() {
        this.config = await Guild.config(this.context.guild)["{MODULE_NAME}"]
    }

    async delete() {

    }
}