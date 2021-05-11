import { Migration } from "../index"

const migration: Migration = {
    table: "admins",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "user_id varchar(255) NOT NULL UNIQUE REFERENCES users(id)"
    ]
}

export default migration
