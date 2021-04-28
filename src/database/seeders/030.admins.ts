import Admin from "../../models/Admin"
import { Seeder } from "../index"

const userIds = ["778665386497015838"]

const seeder: Seeder = {
    table: "admins",

    run: async () => {
        await Promise.all(userIds.map(async user_id => {
            try {
                await new Admin({ user_id }).store()
            } catch {}
        }))
    }
}

export default seeder
