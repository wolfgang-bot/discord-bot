const { v4: uuid } = require("uuid")
const Model = require("../lib/Model.js")

class Module extends Model {
    constructor(values) {
        super({
            table: "modules",
            columns: ["id", "name"],
            defaultValues: {
                id: uuid
            },
            ...values
        })
    }
}

Model.bind(Module, "modules")

module.exports = Module