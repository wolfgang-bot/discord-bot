import { v4 as uuid } from "uuid"
import Model from "../lib/Model"

export type ModuleModelValues = {
    id?: string
    name: string
}

class Module extends Model implements ModuleModelValues {
    static context = {
        model: Module,
        table: "modules"
    }
    name: string

    constructor(values: ModuleModelValues) {
        super({
            table: "modules",
            columns: ["id", "name"],
            defaultValues: {
                id: uuid
            },
            values
        })
    }

    init() {}
}

export default Module