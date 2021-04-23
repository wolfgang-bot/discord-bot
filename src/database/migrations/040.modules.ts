import { Migration } from "../index"

const migration: Migration = {
    table: "modules",

    columns: [
        "`key` varchar(255) PRIMARY KEY"
    ]
}

export default migration
