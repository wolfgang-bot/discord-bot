import WebSocketController from "@personal-discord-bot/shared/dist/WebSocketController"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"
import { success } from "../responses"
import { AuthorizedSocket } from "../SocketManager"

export default class LocaleController extends WebSocketController<AuthorizedSocket> {
    /**
     * Get available locales
     */
    getLocales(send: Function) {
        const locales = LocaleProvider.getLocaleKeys()
        send(success(locales))
    }
}
