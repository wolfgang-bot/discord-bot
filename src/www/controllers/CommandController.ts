import { Request, Response } from "express"
import HttpController from "../../lib/HttpController"
import ModuleRegistry from "../../services/ModuleRegistry"

export default class CommandController extends HttpController {
    /**
     * Get all commands
     */
    static getCommands(req: Request, res: Response) {
        res.send(ModuleRegistry.getAllCommands())
    }
}