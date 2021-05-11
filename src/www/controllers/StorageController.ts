import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import log from "loglevel"
import ModuleRegistry from "../../services/ModuleRegistry"

const ICON_FILE_NAME = "icon.png"
const IMAGES_DIR_NAME = "images"

const ROOT_DIR = path.join(__dirname, "..", "..")
const MODULES_DIR = path.join(ROOT_DIR, "modules")

async function fileExists(file: string) {
    return fs.promises.access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}

export default class StorageController {
    static async getModuleIcon(req: Request, res: Response) {
        const module = ModuleRegistry.modules.find(
            module => module.key === req.params.key
        )

        if (!module || module.isGlobal) {
            return res.sendStatus(404)
        }
        
        try {
            const filePath = path.join(MODULES_DIR, req.params.key, ICON_FILE_NAME)

            if (!await fileExists(filePath)) {
                return res.sendStatus(404)
            }

            fs.createReadStream(filePath).pipe(res)
        } catch (error) {
            log.debug(error)
            res.sendStatus(500)
        }
    }

    static async getModuleImage(req: Request, res: Response) {
        const module = ModuleRegistry.modules.find(
            module => module.key === req.params.key
        )

        if (!module || module.isGlobal) {
            return res.sendStatus(404)
        }
        
        try {
            const filePath = path.join(
                MODULES_DIR,
                req.params.key,
                IMAGES_DIR_NAME,
                req.params.filename
            )

            if (!await fileExists(filePath)) {
                return res.sendStatus(404)
            }

            fs.createReadStream(filePath).pipe(res)
        } catch (error) {
            log.debug(error)
            res.sendStatus(500)
        }
    }
}
