import mysql, { Pool, RowDataPacket } from "mysql2/promise"

class Database {
    private pool: Pool

    async connect() {
        this.pool = mysql.createPool({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        })
    }

    disconnect() {
        this.pool.end()
    }

    async query(query: string, values?: any) {
        const [result] = await this.pool.query<RowDataPacket[]>(query, values)
        return result
    }
}

export default Database
