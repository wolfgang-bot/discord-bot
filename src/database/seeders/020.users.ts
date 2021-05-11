import User from "../../models/User"
import { Seeder } from "../index"

const userIds = ["778665386497015838"]

const seeder: Seeder = {
    table: "users",

    run: async () => {
        await Promise.all(userIds.map(async id => {
            try {
                await new User({ id }).store()
            } catch {}
        }))
    }
}

export default seeder
