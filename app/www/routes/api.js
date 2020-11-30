const express = require("express")

const ConfigController = require("../controllers/ConfigController.js")

const router = express.Router()

router.get("/config/:guildId", ConfigController.getOne)
router.get("/config/descriptive/:guildId", ConfigController.getOneDescriptive)
router.post("/config/:guildId", ConfigController.update)

module.exports = router