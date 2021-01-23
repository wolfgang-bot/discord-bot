import { v4 as uuid } from "uuid"
import Model from "../lib/Model"

export type ModuleModelValues = {
    id?: string
    name: string
}

class Module extends Model implements ModuleModelValues {
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
}

Model.bind(Module, "modules")

export default Module