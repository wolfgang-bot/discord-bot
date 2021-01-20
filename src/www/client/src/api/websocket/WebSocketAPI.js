import { io } from "socket.io-client"

import EventHandlers from "./EventHandlers.js"
import format, { GUILDS } from "../format.js"

class WebSocketAPI {
    static endpoint = "ws://localhost:8080"
    static socket = null

    /**
     * Initialize websocket api
     * 
     * @param {String} token 
     */
    static init(token) {
        // Log into API
        this.websocket.login(token)

        // Attach event listeners
        this.socket.on("set:module-instances", EventHandlers.setModuleInstances)
    }

    /**
     * Log into websocket api
     * 
     * @param {String} token 
     */
    static async login(token) {
        this.socket = io(this.endpoint, {
            auth: {
                token
            }
        })

        await new Promise((resolve, reject) => {
            this.socket.on("connect", resolve)
            this.socket.on("connect_error", reject)
        })
    }

    /**
     * Fetch data from an event
     * 
     * @param {String} event
     * @param {...Any} args
     */
    static fetch(event, ...args) {
        return new Promise((resolve, reject) => {
            this.socket.emit(event, ...args, (res) => {
                if (res.status === "error") {
                    reject(res)
                } else if (res.status === "ok") {
                    resolve(res)
                } else {
                    throw new Error(`Unkown status '${res.status}'`)
                }
            })
        })
    }

    /**
     * @fires get:guilds
     */
    static async getGuilds() {
        const data = await this.fetch("get:guilds")
        return format(GUILDS)(data)
    }

    /**
     * @fires get:config-descriptive
     * 
     * @param {String} guildId
     */
    static getConfigDescriptive(guildId) {
        return this.fetch("get:config-descriptive", guildId)
    }

    /**
     * @fires post:config
     * 
     * @param {String} guildId 
     * @param {Object} newValue 
     */
    static updateConfig(guildId, newValue) {
        return this.fetch("post:config", guildId, newValue)
    }

    /**
     * @fires get:modules
     */
    static getModules() {
        return this.fetch("get:modules")
    }

    /**
     * @fires get:module-instances
     * 
     * @param {String} guildId
     */
    static getModuleInstances(guildId) {
        return this.fetch("get:module-instances", guildId)
    }

    /**
     * @fires post.module-instances/start
     * 
     * @param {String} guildId
     * @param {String} moduleName
     * @param {Array<String>} args
     */
    static startModuleInstance(guildId, moduleName, args) {
        return this.fetch("post:module-instances/start", guildId, moduleName, ["778576977103421453"])
    }

    /**
     * @fires post.module-instances/stop
     * 
     * @param {String} guildId
     * @param {String} moduleName
     */
    static stopModuleInstance(guildId, moduleName) {
        return this.fetch("post:module-instances/stop", guildId, moduleName)
    }
    
    /**
     * @fires post.module-instances/restart
     * 
     * @param {String} guildId
     * @param {String} moduleName
     */
    static restartModuleInstance(guildId, moduleName) {
        return this.fetch("post:module-instances/restart", guildId, moduleName)
    }
}

export default WebSocketAPI