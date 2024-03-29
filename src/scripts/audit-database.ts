import path from "path"
import Discord from "discord.js"
import chalk from "chalk"
import readline from "readline"
import { makeRunnable, run } from "@m.moelter/task-runner"
import dotenv from "dotenv"
import log from "loglevel"
dotenv.config({ path: path.join(__dirname, "..", "..", ".env")})
import ModuleRegistry from "../services/ModuleRegistry"
import database from "../database"
import Guild, { GUILD_STATUS } from "../models/Guild"
import User from "../models/User"
import Member from "../models/Member"
import Module from "../models/Module"
import ModuleInstance from "../models/ModuleInstance"
import Collection from "../lib/Collection"
import ModuleInstanceRegistry from "../services/ModuleInstanceRegistry"
import boot from "../boot"

log.setLevel(log.levels.TRACE)

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

const issues: string[] = []
const fixes: Array<() => Promise<void>> = []

/**
 * Show, fix and verify issues
 */
makeRunnable(async () => {
    // Initialize connections
    await run(() => boot(client, { useHttpServer: false }), "Setup", opts)

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
        database.disconnect(),
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
    await auditModuleInstances()
}

/**
 * Log issues
 */
function logIssues() {
    if (issues.length > 0) {
        log.info(chalk.bold(`${issues.length} issues found:`))
    
        issues.forEach(message => {
            log.info(chalk.red(message))
        })
    } else {
        log.info(chalk.green("No issues found"))
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
                const model = new Guild({
                    id,
                    status: GUILD_STATUS.ACTIVE
                })
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

/**
 * Search for missing static instances
 */
async function auditModuleInstances() {
    await Promise.all(client.guilds.cache.map(async ({ id }) => {
        const guild = await client.guilds.fetch(id)

        const staticModules = ModuleRegistry.modules.filter(module => module.isStatic)
        const keys = staticModules.map(module => `'${module.key}'`).join(",")
        const moduleModels = await Module.whereAll(`\`key\` IN (${keys})`) as Collection<Module>

        const instances = await ModuleInstance.findAllBy("guild_id", id) as Collection<ModuleInstance>

        moduleModels.forEach(moduleModel => {
            if (!instances.some(instance => instance.module_key === moduleModel.key)) {
                issues.push(`Missing static module instance: '${moduleModel.key}' -> '${guild.name}'`)

                fixes.push(async () => {
                    const module = ModuleRegistry.getModule(moduleModel)
                    const args = Object.fromEntries(
                        module.args.map(arg => [arg.key, arg.defaultValue])
                    )
                    await ModuleInstanceRegistry.guild(guild).startInstance(client, moduleModel, args, false)
                })
            }
        })
    }))
}
