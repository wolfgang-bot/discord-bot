import express from "express"
import StorageController from "../controllers/StorageController"

const router = express.Router()

router.get("/modules/:key/icon.svg", StorageController.getModuleIcon)
router.get("/modules/:key/images/:filename", StorageController.getModuleImage)

export default router
