import { Request, Response } from "express"
import ModuleRegistry from "../../services/ModuleRegistry"

export default class CommandController {
    /**
     * Get all commands
     */
    static getCommands(req: Request, res: Response) {
        res.send(ModuleRegistry.getAllCommands())
    }
}
