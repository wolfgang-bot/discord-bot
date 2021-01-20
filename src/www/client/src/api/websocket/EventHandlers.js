import store from "../../store"
import { setModuleInstances } from "../../store/actions.js"

class EventHandlers {
    /**
     * @listens set:module-instances
     */
    static setModuleInstances(data) {
        console.log(data)
    }
}

export default EventHandlers