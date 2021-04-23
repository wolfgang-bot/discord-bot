import { Migration } from "../index"

const migration: Migration = {
    table: "events",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "type TINYINT NOT NULL",
        "timestamp BIGINT UNSIGNED NOT NULL",
        "guild_id varchar(255)",
        "user_id varchar(255)",
        "meta TEXT"
    ]
}

export default migration
