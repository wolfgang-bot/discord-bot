import { Migration } from "../index"

const migration: Migration = {
    table: "modules",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "key varchar(255) UNIQUE"
    ]
}

export default migration