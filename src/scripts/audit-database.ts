import path from "path"
import Discord from "discord.js"
import chalk from "chalk"
import readline from "readline"
import { makeRunnable, run } from "@m.moelter/task-runner"
import dotenv from "dotenv"
import ModuleRegistry from "../services/ModuleRegistry"
import database from "../database"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import User from "@personal-discord-bot/shared/dist/models/User"
import Member from "@personal-discord-bot/shared/dist/models/Member"
dotenv.config({ path: path.join(__dirname, "..", "..", ".env")})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const opts = {
    discardStdin: false
}

/**
 * Await user input from the console (promise-based)
 */
function question(content: string) {
    return new Promise(resolve => rl.question(content, resolve))
}

const client = new Discord.Client()

const issues = []
const fixes = []

/**
 * Show, fix and verify issues
 */
makeRunnable(async () => {
    // Initialize connections
    await run(() => Promise.all([
        database.connect(),
        client.login(process.env.DISCORD_BOT_TOKEN),
        ModuleRegistry.loadModules()
    ]), "Setup", opts)

    // Audit database
    await run(audit, "Audit", opts)
    logIssues()

    if (issues.length > 0) {
        const answer = await question("Do you want to fix the issues? (y,n): ")
        
        if (answer === "y") {
            // Run fixes
            await run(async () => {
                for (let fix of fixes) {
                    await fix()
                }
            }, "Repair")
    
            // Run audits
            await run(audit, "Verify")
            logIssues()
        }
    }

    // Close connections
    await run(() => Promise.all([
        database.db.close(),
        client.destroy()
    ]), "Cleanup")

    rl.close()
})()

/**
 * Audit database
 */
async function audit() {
    issues.length = 0
    fixes.length = 0

    // Run audits
    await auditGuilds()
    await auditUsers()
    await auditMembers()
}

/**
 * Log issues
 */
function logIssues() {
    if (issues.length > 0) {
        console.log(chalk.bold(`${issues.length} issues found:`))
    
        issues.forEach(message => {
            console.log(chalk.red(message))
        })
    } else {
        console.log(chalk.green("No issues found"))
    }
}

/**
 * Search for missing guilds
 */
async function auditGuilds() {
    await Promise.all(client.guilds.cache.map(async ({ id }) => {
        const guild = await client.guilds.fetch(id)
        await guild.members.fetch()

        const model = await Guild.findBy("id", id)

        if (!model) {
            issues.push(`Missing guild: '${guild.name}' ('${guild.id}')`)

            fixes.push(() => {
                const model = new Guild({ id })
                return model.store()
            })
        }
    }))
}

/**
 * Search for missing users
 */
async function auditUsers() {
    await Promise.all(client.users.cache.map(async ({ id }) => {
        const user = await client.users.fetch(id)

        if (user.bot) {
            return
        }

        const model = await User.findBy("id", id)

        if (!model) {
            issues.push(`Missing user: '${user.username}' ('${user.id}')`)

            fixes.push(() => {
                const user = new User({ id })
                return user.store()
            })
        }
    }))
}

/**
 * Search for missing members
 */
async function auditMembers() {
    await Promise.all(client.guilds.cache.map(async ({ id }) => {
        const guild = await client.guilds.fetch(id)
        const members = await guild.members.fetch()

        await Promise.all(members.map(async (member) => {    
            if (member.user.bot) {
                return
            }

            const model = await Member.where(`user_id = '${member.user.id}' AND guild_id = '${guild.id}'`)
    
            if (!model) {
                issues.push(`Missing member: '${member.user.username}' -> '${guild.name}' ('${member.user.id}' -> '${guild.id}')`)

                fixes.push(() => {
                    const model = new Member({
                        guild_id: guild.id,
                        user_id: member.user.id
                    })
                    return model.store()
                })
            }
        }))
    }))
}
