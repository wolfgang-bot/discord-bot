import express from "express"
import StorageController from "../controllers/StorageController"

const router = express.Router()

router.get("/modules/:key/icon.png", StorageController.getModuleIcon)

export default router