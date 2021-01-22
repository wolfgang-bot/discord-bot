import { Migration } from "../index"

const migration: Migration = {
    table: "modules",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "name varchar(255) UNIQUE"
    ]
}

export default migration