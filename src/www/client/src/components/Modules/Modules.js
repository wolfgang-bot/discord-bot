import React from "react"
import { CircularProgress, Grid } from "@material-ui/core"

import ModuleCard from "./ModuleCard.js"
import useAPIData from "../../utils/useAPIData.js"

function Modules({ guild }) {
    const modules = useAPIData("getModules")
    const instances = useAPIData({
        method: "getModuleInstances",
        data: guild.id
    })

    if (modules.isLoading || instances.isLoading) {
        return <CircularProgress/>
    }

    const activeModules = modules.data.filter(module => instances.data.includes(module.name))
    const inactiveModules = modules.data.filter(module => !instances.data.includes(module.name))

    return (
        <Grid container spacing={2}>
            { activeModules.concat(inactiveModules).map(module => (
                <Grid item key={module.name}>
                    <ModuleCard
                        guild={guild}
                        module={module}
                        onUpdate={instances.reload}
                        active={instances.data.includes(module.name)}
                    />
                </Grid>
            ))}
        </Grid>
    )
}

export default Modules