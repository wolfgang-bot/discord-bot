import CommandGroup from "../../../lib/CommandGroup"
import CodeblocksCommand from "./codeblocks"

export default class GuideCommandGroup extends CommandGroup {
    name = "guide"
    alias = ["guides"]
    group = "General"
    description = "command_guide_desc"

    constructor() {
        super([
            new CodeblocksCommand()
        ])
    }
}
