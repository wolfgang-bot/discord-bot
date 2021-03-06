import Model from "../lib/Model"

export type ModuleModelValues = {
    key: string
}

class Module extends Model implements ModuleModelValues {
    static context = {
        model: Module,
        table: "modules"
    }
    pkColumn = "key"
    key: string

    constructor(values: ModuleModelValues) {
        super({
            table: "modules",
            columns: ["key"],
            values
        })
    }

    init() {}
}

export default Module
