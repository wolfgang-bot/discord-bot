import { Request, Response } from "express"
import HttpController from "../../lib/HttpController"
import ModuleRegistry from "../../services/ModuleRegistry"

export default class ModuleController extends HttpController {
    /**
     * Get all modules available to the requesting user
     */
    static getModules(req: Request, res: Response) {
        const modules = ModuleRegistry.modules.filter(module => !module.isPrivate && !module.isGlobal)
        modules.forEach(module => ModuleRegistry.translate(module))

        res.send(modules)
    }
}