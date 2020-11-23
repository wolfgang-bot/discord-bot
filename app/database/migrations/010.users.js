module.exports = {
    table: "users",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "user_id varchar(255) NOT NULL",
        "guild_id varchar(255) NOT NULL",
        "reputation int NOT NULL"
    ]
}