import { Request, Response } from "express";
import HttpController from "../../lib/HttpController"
import CommandRegistry from "../../services/CommandRegistry";

export default class CommandController extends HttpController {
    /**
     * Get all commands
     */
    static getCommands(req: Request, res: Response) {
        const commands = CommandRegistry.root.getSubCommands()
        res.send(commands)
    }
}