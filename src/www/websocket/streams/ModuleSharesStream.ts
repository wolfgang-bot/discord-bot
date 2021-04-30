import { Readable } from "../../../lib/Stream"
import BroadcastChannel from "../../../services/BroadcastChannel"
import ModuleInstance from "../../../models/ModuleInstance"

export default class ModuleSharesStream extends Readable<Record<string, number>> {
    constructor() {
        super({ useMonoBuffer: true })
        
        this.pushDataset = this.pushDataset.bind(this)
    }

    construct() {
        this.pushDataset().then(() => {
            BroadcastChannel.on("statistics/module-instance-start", this.pushDataset)
            BroadcastChannel.on("statistics/module-instance-stop", this.pushDataset)
        })
    }

    destroy() {
        BroadcastChannel.removeListener("statistics/module-instance-start", this.pushDataset)
        BroadcastChannel.removeListener("statistics/module-instance-stop", this.pushDataset)
    }

    collectBuffer(buffer: Record<string, number>) {
        return buffer
    }

    async createDataset() {
        return await ModuleInstance.countModuleKeys()
    }

    async pushDataset() {
        this.push(await this.createDataset())
    }
}
