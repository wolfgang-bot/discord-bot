import { Migration } from "../index"

const migration: Migration = {
    table: "module_instances",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "module_key varchar(255) NOT NULL REFERENCES modules(id)",
        "guild_id varchar(255) NOT NULL REFERENCES guilds(id)",
        "config TEXT NOT NULL",
        "data TEXT NOT NULL"
    ]
}

export default migration
