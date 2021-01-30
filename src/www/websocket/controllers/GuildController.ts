import { Response } from "express"
import WebSocketController from "../../../lib/WebSocketController"
import HttpOAuthController from "../../controllers/OAuthController"
import { success } from "../responses"
import { InternalRequest } from "../../server"

export default class GuildController extends WebSocketController {
    /**
     * Forward request to the OAuthController.getGuilds method
     */
    async getGuilds(send: Function) {
        HttpOAuthController.getGuilds(this.socket as unknown as InternalRequest, {
            send: data => send(success(data))
        } as Response)
    }
}