import WebSocketController from "./WebSocketController";

export default abstract class WebSocketEmitter extends WebSocketController {
    abstract attach(): void
    abstract remove(): void
}