module.exports = {
    table: "module_instances",

    columns: [
        "id varchar(255) PRIMARY KEY",
        "module_id varchar(255) NOT NULL REFERENCES modules(id)",
        "guild_id varchar(255) NOT NULL REFERENCES guilds(id)",
        "config TEXT NOT NULL",
        "data TEXT NOT NULL"
    ]
}