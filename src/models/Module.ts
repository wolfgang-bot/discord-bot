import { v4 as uuid } from "uuid"
import Model from "../lib/Model"

export type ModuleModelValues = {
    id?: string
    key: string
}

class Module extends Model implements ModuleModelValues {
    static context = {
        model: Module,
        table: "modules"
    }
    key: string

    constructor(values: ModuleModelValues) {
        super({
            table: "modules",
            columns: ["id", "key"],
            defaultValues: {
                id: uuid
            },
            values
        })
    }

    init() {}
}

export default Module