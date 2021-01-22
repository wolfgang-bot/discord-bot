import { Migration } from "../index"

const migration: Migration = {
    table: "users",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "access_token varchar(255)",
        "refresh_token varchar(255)",
    ]
}

export default migration