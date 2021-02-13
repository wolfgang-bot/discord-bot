import WebSocketEmitter from "../../../lib/WebSocketEmitter"
import BroadcastChannel from "../../../services/BroadcastChannel"
import Event, { EVENT_TYPES } from "../../../models/Event"

const EVENT_NAMES = {
    [EVENT_TYPES.GUILD_MEMBER_ADD]: "guild-member-add",
    [EVENT_TYPES.GUILD_MEMBER_REMOVE]: "guild-member-remove",
    [EVENT_TYPES.MESSAGE_SEND]: "message-send",
    [EVENT_TYPES.VOICECHANNEL_LEAVE]: "voicechannel-leave"
}

export default class StatisticsEmitter extends WebSocketEmitter {
    attach() {
        BroadcastChannel.on("statistics/guild-member-add", this.handleGuildMemberAdd.bind(this))
    }

    remove() {

    }

    async pushInitialValues() {
        await Promise.all(Object.values(this.socket.guilds).map(async guild => {
            const events = await Event.findAllBy("guild_id", guild.id)
        }))
    }

    handleGuildMemberAdd(event: Event) {
        if (event.guild_id in this.socket.guilds) {
            this.push("members", [event])
        }
    }

    push(event: string, data: Event[]) {
        this.socket.emit(`statistics/${event}`, data)
    }
}