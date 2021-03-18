import { Readable } from "../../../lib/Stream"
import BroadcastChannel from "../../../services/BroadcastChannel"
import Event, { EVENT_TYPES, ModuleInstanceEventMeta } from "../../../models/Event"
import { OHLCDataset } from "../../../lib/datasets"
import SVDataset from "../../../lib/datasets/SVDataset"

type Dataset = [
    OHLCDataset<Event<ModuleInstanceEventMeta>>,
    SVDataset<Event<ModuleInstanceEventMeta>>
]

export default class ModuleInstanceStream extends Readable<Dataset> {
    events: Event<ModuleInstanceEventMeta>[]

    constructor() {
        super({ useMonoBuffer: true })

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

    collectBuffer(buffer: Dataset) {
        return buffer
    }

    createDataset(events: Event<ModuleInstanceEventMeta>[]) {
        return [
            new OHLCDataset(
                events,
                (event) => event.meta.instanceCount
            ),
            new SVDataset(
                events,
                null,
                (event) => event.type === EVENT_TYPES.MODULE_INSTANCE_START ? 1 : -1
            )
        ] as Dataset
    }

    pushDataset() {
        this.push(this.createDataset(this.events))
    }

    async pushInitialValues() {
        const events = await Event.findByTypes([
            EVENT_TYPES.MODULE_INSTANCE_START,
            EVENT_TYPES.MODULE_INSTANCE_STOP
        ])

        events.reverse()

        this.events = events
        this.pushDataset()
    }

    handleModuleInstanceEvent(event: Event) {
        this.events.push(event)
        this.pushDataset
    }
}
