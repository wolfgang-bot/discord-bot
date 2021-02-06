import express from "express"
import ProtectMiddleware from "../middleware/ProtectMiddleware"
import OAuthController from "../controllers/OAuthController"

const router = express.Router()

router.get("/oauth/discord", OAuthController.oauthDiscord)
router.get("/oauth/discord/profile", ProtectMiddleware.required, OAuthController.getProfile)

export default router