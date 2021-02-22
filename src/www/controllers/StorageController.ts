import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import ModuleRegistry from "../../services/ModuleRegistry"

const ICON_FILE_NAME = "icon.png"

const ROOT_DIR = path.join(__dirname, "..", "..")
const MODULES_DIR = path.join(ROOT_DIR, "modules")

export default class StorageController {
    static getModuleIcon(req: Request, res: Response) {
        const module = ModuleRegistry.modules.find(
            module => module.key === req.params.key
        )

        if (!module || module.isGlobal) {
            return res.send(404)
        }
        
        try {
            const filePath = path.join(MODULES_DIR, req.params.key, ICON_FILE_NAME)
            fs.createReadStream(filePath).pipe(res)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            res.send(500)
        }
    }
}
