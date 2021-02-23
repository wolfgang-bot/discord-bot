import { RowDataPacket } from "mysql2"
import Collection from "@personal-discord-bot/shared/dist/Collection"
import database from "../database"

export type ModelProps = {
    table: string
    columns: string[]
    values: object
    defaultValues?: object
}

export type ModelContext = {
    model: new (values: object) => Model
    table: string
}

type QueryOptions = {
    initArgs?: boolean
}

/**
 * Class representing a Model. Strictly bound to the database.
 */
abstract class Model {
    static context: ModelContext
    private table: string
    private columns: string[]
    id: string

    abstract init(...args: any[]): void | Promise<void>

    /**
     * Select all matches for the given SQL selector and return a
     * collection containing models for all rows in the query result
     */
    static async whereAll(selector: string, options: QueryOptions = {}): Promise<Collection<Model>> {
        // Get matches from database
        const query = `SELECT * FROM ${this.context.table} WHERE ${selector}`
        const results: RowDataPacket[] = await database.all(query)

        // Create models from results
        const models = await Promise.all(results.map(async row => {
            const model = new this.context.model(row)

            await model.init(options.initArgs)

            return model
        }))

        return new Collection<Model>(...models)
    }

    /**
     * Executes Model.whereAll with the given arguments and returns the first result
     */
    static async where(...args: Parameters<typeof Model.whereAll>): Promise<Model> {
        return (await Model.whereAll.apply(this, args))[0]
    }

    /**
     * Create a model from the first match for 'column = value'
     */
    static async findBy(column: string, value: string, options?: QueryOptions): ReturnType<typeof Model.where> {
        return await Model.where.call(this, `${column} = '${value}'`, options)
    }

    /**
     * Create a collection from all matches for 'column = value'
     */
    static async findAllBy(column: string, value: string, options?: QueryOptions): ReturnType<typeof Model.whereAll> {
        return await Model.whereAll.call(this, `${column} = '${value}'`, options)
    }

    /**
     * Create a collection from all entries
     */
    static async getAll(options?: QueryOptions): ReturnType<typeof Model.whereAll> {
        return await Model.whereAll.call(this, "1", options)
    }

    /**
     * Create models from database results
     */
    static fromRows(rows: RowDataPacket[]) {
        return new Collection<Model>(...rows.map(row => new this.context.model(row)))
    }

    /**
     * Store the model into the database
     */
    async store() {
        const query = `INSERT INTO ${this.table}(${this.columns.join(",")}) VALUES (${"?,".repeat(this.columns.length).slice(0, -1)})`
        await database.run(query, this.getColumns())
    }

    /**
     * Update the model in the database
     */
    async update() {
        const query = `UPDATE ${this.table} SET ${this.columns.map(col => `${col} = ?`).join(", ")} WHERE id = '${this.id}'`
        await database.run(query, this.getColumns())
    }

    /**
     * Delete the model from the database
     */
    async delete() {
        const query = `DELETE FROM ${this.table} WHERE id = '${this.id}'`
        await database.run(query)
    }

    /**
     * Make an array which contains the column's values
     */
    getColumns() {
        const values = []
        this.columns.forEach(column => {
            if (typeof this[column] !== "undefined") {
                if (typeof this[column] === "object") {
                    values.push(JSON.stringify(this[column]))
                } else {
                    values.push(this[column])
                }
            }
        })
        return values
    }

    /**
     * Create a model
     */
    constructor(props: ModelProps) {
        if (!props.columns.includes("id")) {
            throw new Error("Every model must have a column: 'id'")
        }

        this.table = props.table
        this.columns = props.columns

        props.columns.forEach(key => {
            this[key] = props.values[key]
        })

        // Fill empty values with default values
        for (let key in props.defaultValues) {
            if (!this.columns.includes(key)) {
                console.error(`Unknown column '${key}'. Default values are ment to fill empty columns`)
            }

            if (!this[key]) {
                const getter = props.defaultValues[key]

                if (typeof getter === "function") {
                    this[key] = getter()
                } else {
                    this[key] = getter
                }
            }
        }
    }
}

export default Model
