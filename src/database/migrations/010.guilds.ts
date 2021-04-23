import { Migration } from "../index"

const migration: Migration = {
    table: "guilds",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "status int NOT NULL"
    ]
}

export default migration
