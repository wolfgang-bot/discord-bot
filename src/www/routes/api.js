const express = require("express")

const ProtectMiddleware = require("../middleware/ProtectMiddleware.js")

const OAuthController = require("../controllers/OAuthController.js")
const ConfigController = require("../controllers/ConfigController.js")
const ModulesController = require("../controllers/ModulesController.js")

const router = express.Router()

router.get("/oauth/discord", OAuthController.oauthDiscord)
router.get("/oauth/discord/profile", ProtectMiddleware.required, OAuthController.getProfile)
router.get("/oauth/discord/guilds", ProtectMiddleware.required, OAuthController.getGuilds)
router.get("/oauth/discord/guild/:id", ProtectMiddleware.required, OAuthController.getGuild)

router.get("/config/:guildId", ProtectMiddleware.required, ConfigController.getOne)
router.get("/config/descriptive/:guildId", ProtectMiddleware.required, ConfigController.getOneDescriptive)
router.post("/config/:guildId", ProtectMiddleware.required, ConfigController.update)

router.get("/modules", ModulesController.getAll)
router.get("/modules/instances/:guildId", ProtectMiddleware.required, ModulesController.getInstances)
router.post("/modules/instances/:guildId/start/:moduleName", ProtectMiddleware.required, ModulesController.start)
router.post("/modules/instances/:guildId/stop/:moduleName", ProtectMiddleware.required, ModulesController.stop)
router.post("/modules/instances/:guildId/restart/:moduleName", ProtectMiddleware.required, ModulesController.restart)

module.exports = router