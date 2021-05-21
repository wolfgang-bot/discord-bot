import Discord from "discord.js"
import CustomCommand from "../CustomCommand"
import LocaleProvider from "../../../services/LocaleProvider"

const MIN_AMOUNT = 1
const MAX_AMOUNT = 100

export default class SweepCommand extends CustomCommand {
    name = "sweep"
    group = "Moderation"
    permissions: Discord.PermissionString[] = ["MANAGE_MESSAGES"]
    description = "command_sweep_desc"
    arguments = "command_sweep_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = (await LocaleProvider.guild(message.guild)).scope(this.getModule())

        if (!args[0]) {
            throw locale.translate("error_missing_arg", "amount")
        }

        const amount = parseInt(args[0])

        if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
            throw locale.translate("error_amount_between", MIN_AMOUNT, MAX_AMOUNT)
        }

        await (message.channel as Discord.TextChannel).bulkDelete(amount)
    }
}
