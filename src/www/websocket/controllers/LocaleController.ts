import WebSocketController from "../../../lib/WebSocketController"
import LocaleProvider from "../../../services/LocaleProvider"
import { success } from "../responses"

export default class LocaleController extends WebSocketController {
    /**
     * Get available locales
     */
    getLocales(send: Function) {
        const locales = LocaleProvider.getLocaleKeys()
        send(success(locales))
    }
}