import Discord from "discord.js"
import { Readable } from "../../../lib/Stream"
import Module from "../../../lib/Module"
import BroadcastChannel from "../../../services/BroadcastChannel"
import { AuthorizedSocket } from "../SocketManager"
import { SubscriptionArgs } from "../types"
import ModuleRegistry from "../../../services/ModuleRegistry"
import Guild from "../../../models/Guild"
import { mapAsync } from "../../../utils"
import ModuleInstance from "../../../models/ModuleInstance"

type ModuleJSON = ReturnType<typeof Module["toJSON"]>

export default class GuildModuleStream extends Readable<ModuleJSON[]> {
    modules: Record<string, ModuleJSON> = {}
    guild: Guild

    constructor(
        public client: Discord.Client,
        public socket: AuthorizedSocket,
        public args: SubscriptionArgs
    ) {
        super({ useMonoBuffer: true })

        this.handleInstanceUpdate = this.handleInstanceUpdate.bind(this)
        this.handleInstanceStartStop = this.handleInstanceStartStop.bind(this)
    }

    construct() {
        this.pushInitialValues()
        BroadcastChannel.on("module-instance/start", this.handleInstanceStartStop)
        BroadcastChannel.on("module-instance/stop", this.handleInstanceStartStop)
        BroadcastChannel.on("module-instance/update", this.handleInstanceUpdate)
    }
    
    destroy() {
        BroadcastChannel.removeListener("module-instance/start", this.handleInstanceStartStop)
        BroadcastChannel.removeListener("module-instance/stop", this.handleInstanceStartStop)
        BroadcastChannel.removeListener("module-instance/update", this.handleInstanceUpdate)
    }

    collectBuffer(buffer: ModuleJSON[][]) {
        return buffer.flat()
    }

    async fetchModules() {
        const modules = ModuleRegistry
            .getPublicModules({ includeStatic: true })
            .map(module => module.toJSON())
        this.guild = await Guild.findBy("id", this.args.guildId) as Guild
        modules.forEach(module => {
            this.modules[module.key] = module
        })
        await mapAsync(modules, this.updateModule.bind(this))
    }

    async updateModule(module: ModuleJSON) {
        module.remainingInstances = await ModuleRegistry.getRemainingInstances(
            module.key,
            this.guild 
        )
    }

    getModules() {
        return Object.values(this.modules)
    }

    async pushInitialValues() {
        await this.fetchModules()
        this.push(this.getModules())
    }

    async handleInstanceStartStop(model: ModuleInstance) {
        if (model.guild_id === this.args.guildId) {
            const module = this.modules[model.module_key]
            await this.updateModule(module)
            this.push([module])
        }
    }

    async handleInstanceUpdate(instance: Module) {
        if (instance.context.guild.id === this.args.guildId) {
            const module = this.modules[instance.context.module.key]
            await this.updateModule(module)
            this.push([module])
        }
    }
}
