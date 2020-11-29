const express = require("express")
const ConfigController = require("../controllers/ConfigController.js")

const router = express.Router()

router.get("/:guildId", ConfigController.get)

module.exports = router