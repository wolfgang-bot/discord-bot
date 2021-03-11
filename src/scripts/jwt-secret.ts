import crypto from "crypto"
import chalk from "chalk"
import log from "loglevel"

const secret = crypto.randomBytes(64).toString("hex")

log.info(`
Copy-Paste your JWT secret into the .env file under JWT_SECRET

${chalk.underline(secret)}
`)
