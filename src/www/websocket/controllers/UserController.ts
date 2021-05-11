import Collection from "../../../lib/Collection"
import WebSocketController from "../../../lib/WebSocketController"
import Admin from "../../../models/Admin"
import User from "../../../models/User"
import { isBotAdmin } from "../decorators"
import { error, success } from "../responses"

class UserController extends WebSocketController {
    @isBotAdmin
    async getAdmins(_: void, send: Function) {
        const admins = await Admin.getAll() as Collection<Admin>

        await admins.mapAsync(admin => admin.fetchUser())
        await admins.mapAsync(admin =>
            admin.user.fetchDiscordUser(this.client)
        )

        send(success(admins))
    }

    @isBotAdmin
    async createAdmin({ userId }: { userId: string }, send: Function) {
        const hasAdmin = !!(await Admin.findBy("user_id", userId))

        if (hasAdmin) {
            send(error(400, "Admin already exists"))
            return
        }
        
        const user = await User.findBy("id", userId) as User

        if (!user) {
            send(error(404, "User not found"))
            return
        }

        const admin = new Admin({ user_id: user.id })
        await admin.store()

        await admin.fetchUser()
        await admin.user.fetchDiscordUser(this.client)

        send(success(admin))
    }

    @isBotAdmin
    async removeAdmin({ id }: { id: string }, send: Function) {
        const admin = await Admin.findBy("id", id) as Admin

        if (!admin) {
            send(error(404, "Admin not found"))
            return
        }

        await admin.fetchUser()
        await admin.user.fetchDiscordUser(this.client)

        await admin.delete()
        
        send(success(admin))
    }
}

export default UserController
