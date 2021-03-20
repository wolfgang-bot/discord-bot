import { Migration } from "../index"

const migrate: Migration = {
    table: "guilds",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "status int NOT NULL"
    ]
}

export default migrate
