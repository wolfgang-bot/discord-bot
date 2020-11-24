module.exports = {
    table: "guilds",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "guild_id varchar(255) NOT NULL UNIQUE",
        "config TEXT NOT NULL"
    ]
}