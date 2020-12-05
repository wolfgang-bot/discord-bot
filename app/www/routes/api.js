const express = require("express")

const ProtectMiddleware = require("../middleware/ProtectMiddleware.js")

const ConfigController = require("../controllers/ConfigController.js")
const OAuthController = require("../controllers/OAuthController.js")

const router = express.Router()

router.get("/config/:guildId", ProtectMiddleware.required, ConfigController.getOne)
router.get("/config/descriptive/:guildId", ProtectMiddleware.required, ConfigController.getOneDescriptive)
router.post("/config/:guildId", ProtectMiddleware.required, ConfigController.update)

router.get("/oauth/discord", OAuthController.oauthDiscord)
router.get("/oauth/discord/profile", ProtectMiddleware.required, OAuthController.getProfile)
router.get("/oauth/discord/guilds", ProtectMiddleware.required, OAuthController.getGuilds)

module.exports = router