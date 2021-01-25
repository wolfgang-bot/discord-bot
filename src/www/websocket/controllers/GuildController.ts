import WebSocketController from "../../../lib/WebSocketController"
import HttpOAuthController from "../../controllers/OAuthController"
import { success } from "../responses"

export default class GuildController extends WebSocketController{
    /**
     * Forward request to the OAuthController.getGuilds method
     */
    async getGuilds(send: Function) {
        HttpOAuthController.getGuilds(this.socket, {
            send: data => send(success(data))
        })
    }
}