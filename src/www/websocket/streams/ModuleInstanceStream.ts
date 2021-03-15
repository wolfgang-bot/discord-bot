import { Readable } from "../../../lib/Stream"
import Collection from "../../../lib/Collection"
import BroadcastChannel from "../../../services/BroadcastChannel"
import Event, { EVENT_TYPES, ModuleInstanceEventMeta } from "../../../models/Event"
import config from "../../config"

export default class ModuleInstanceStream extends Readable<Event<ModuleInstanceEventMeta>[]> {
    constructor() {
        super()

        this.handleModuleInstanceEvent = this.handleModuleInstanceEvent.bind(this)
    }

    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.on("statistics/module-instance-start", this.handleModuleInstanceEvent)
            BroadcastChannel.on("statistics/module-instance-stop", this.handleModuleInstanceEvent)
        })
    }

    destroy() {
        BroadcastChannel.removeListener("statistics/module-instance-start", this.handleModuleInstanceEvent)
        BroadcastChannel.removeListener("statistics/module-instance-stop", this.handleModuleInstanceEvent)
    }

    collectBuffer(buffer: Event<ModuleInstanceEventMeta>[][]) {
        return buffer.flat()
    }

    async pushInitialValues() {
        const events = await Event.whereAll(`
            (
                type = '${EVENT_TYPES.MODULE_INSTANCE_START}' OR 
                type = '${EVENT_TYPES.MODULE_INSTANCE_STOP}'
            ) ORDER BY timestamp DESC
            LIMIT ${config.stream.maxInitialValues}
        `) as Collection<Event<ModuleInstanceEventMeta>>

        events.reverse()

        this.push(events)
    }

    handleModuleInstanceEvent(event: Event) {
        this.push([event])
    }
}
