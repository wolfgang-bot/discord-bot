import { Response } from "express"
import HttpController from "../../lib/HttpController"
import Guild from "../../models/Guild"
import { compareStructure, verifyConstraints, insertIntoDescriptiveObject } from "../../utils"
import defaultConfig from "../../config/default"
import { checkPermissions } from "../../utils"
import { InternalRequest } from "../server"

export default class ConfigController extends HttpController {
    /**
     * Get a guild's configuration object
     */
    static async getOne(req: InternalRequest, res: Response) {
        const guild = await Guild.findBy("id", req.params.guildId) as Guild

        if (!guild) {
            return res.status(404).end()
        }

        await guild.fetchDiscordGuild(ConfigController.client)

        if (!await checkPermissions(guild.discordGuild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }

        res.send(guild.config)
    }

    /**
     * Get a guild's configuration as a descriptive object
     */
    static async getOneDescriptive(req: InternalRequest, res: Response) {
        const guild = await Guild.findBy("id", req.params.guildId) as Guild

        if (!guild) {
            return res.status(404).end()
        }

        await guild.fetchDiscordGuild(ConfigController.client)

        if (!await checkPermissions(guild.discordGuild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }


        const result = insertIntoDescriptiveObject(guild.config, defaultConfig)

        res.send(result)
    }

    /**
     * Update a guild's configuration
     */
    static async update(req: InternalRequest, res: Response) {
        const guild = await Guild.findBy("id", req.params.guildId) as Guild

        if (!guild) {
            return res.status(404).end()
        }

        await guild.fetchDiscordGuild(ConfigController.client)

        if (!await checkPermissions(guild.discordGuild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }

        /**
         * Check if the given object has the same structure as the existing
         * configuration object
         */
        if (!compareStructure(guild.config, req.body)) {
            return res.status(400).end()
        }

        /**
         * Check if the given object matches all constraints
         */
        const errors = verifyConstraints(req.body, defaultConfig)
        
        if (errors) {
            return res.status(400).send(errors)
        }

        guild.config = req.body
        await guild.update()

        res.status(200).send()
    }
}