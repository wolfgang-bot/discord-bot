module.exports = {
    table: "members",
    
    columns: [
        "id varchar(255) PRIMARY KEY",
        "user_id varchar(255) NOT NULL REFERENCES users(id)",
        "guild_id varchar(255) NOT NULL REFERENCES guilds(id)",
        "reputation int NOT NULL"
    ]
}