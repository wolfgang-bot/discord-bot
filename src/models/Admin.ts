import { v4 as uuid } from "uuid"
import Model from "../lib/Model"

export type AdminModelValues = {
    id?: string
    user_id: string
}

class Admin extends Model implements AdminModelValues {
    static context = {
        model: Admin,
        table: "admins"
    }
    id?: string
    user_id: string
    user?: User
    
    constructor(values: AdminModelValues) {
        super({
            table: "admins",
            columns: ["id", "user_id"],
            values,
            defaultValues: {
                id: uuid
            }
        })
    }
    
    init() {}

    async fetchUser() {
        if (this.user !== undefined) {
            return
        }
        this.user = await User.findBy("id", this.user_id) as User
    }

    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            user: this.user
        }
    }
}

export default Admin

import User from "./User"
