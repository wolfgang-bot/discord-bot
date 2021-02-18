import express from "express"
import ProtectMiddleware from "../middleware/ProtectMiddleware"
import OAuthController from "../controllers/OAuthController"
import ModuleController from "../controllers/ModuleController"
import CommandController from "../controllers/CommandController"

const router = express.Router()

router.get("/oauth/discord", OAuthController.oauthDiscord)
router.get("/oauth/discord/profile", ProtectMiddleware.required, OAuthController.getProfile)
router.get("/modules", ModuleController.getModules)
router.get("/commands", CommandController.getCommands)

export default router