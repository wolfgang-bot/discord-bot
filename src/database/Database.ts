import mysql, { Connection, RowDataPacket } from "mysql2/promise"

class Database {
    public db: Connection

    async connect() {
        this.db = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        })
    }

    disconnect() {
        this.db.destroy()
    }

    async query(query: string, values?: any) {
        const [result] = await this.db.query<RowDataPacket[]>(query, values)
        return result
    }
}

export default Database
