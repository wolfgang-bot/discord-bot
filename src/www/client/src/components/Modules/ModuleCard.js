import React from "react"
import { Card, CardActionArea, CardContent, CardActions, Typography } from "@material-ui/core"

import StartButton from "./StartButton.js"
import StopButton from "./StopButton.js"
import RestartButton from "./RestartButton.js"

function ModuleCard({ module, guild, active, onUpdate }) {
    const commonButtonProps = { module, guild, onUpdate }

    return (
        <Card>
            <CardActionArea>
                <CardContent>
                    <Typography>
                        { module.name }
                    </Typography>
                </CardContent>
            </CardActionArea>

            <CardActions>
                <StartButton
                    {...commonButtonProps}
                    disabled={active}
                    size="small"
                />
                <StopButton
                    {...commonButtonProps}
                    disabled={!active}
                    size="small"
                />
                <RestartButton
                    {...commonButtonProps}
                    disabled={!active}
                    size="small"
                />
            </CardActions>
        </Card>
    )
}

export default ModuleCard