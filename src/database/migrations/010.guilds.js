module.exports = {
    table: "guilds",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "locale TEXT NOT NULL",
        "config TEXT NOT NULL"
    ]
}