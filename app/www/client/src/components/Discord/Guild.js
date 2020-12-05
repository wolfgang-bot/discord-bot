import React, { useState } from "react"
import clsx from "clsx"
import { Link } from "react-router-dom"
import { Paper, Typography, Grid, Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import { DISCORD_BOT_INVITE_URL } from "../../config/constants.js"
import GuildIcon from "./GuildIcon.js"

const useStyles = makeStyles(theme => ({
    guild: {
        padding: theme.spacing(2),
        maxWidth: 600,
        width: "100%"
    }
}))

function Guild({ className, guild }) {
    const classes = useStyles()

    const [isMouseOver, setIsMouseOver] = useState(false)

    return (
        <Paper
            className={clsx(className, classes.guild)}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
        >
            <Grid container wrap="nowrap">
                <Grid item container spacing={2} wrap="nowrap">
                    <Grid item>
                        <GuildIcon guild={guild} animated={isMouseOver} />
                    </Grid>

                    <Grid item container alignContent="center">
                        <Typography variant="subtitle1">{guild.name}</Typography>
                    </Grid>
                </Grid>

                <Grid item container justify="flex-end" alignItems="center">
                    { guild.active ? (
                        <Link to={"/config/" + guild.id}>
                            <Button color="primary" variant="contained">Config</Button>
                        </Link>
                    ) : (
                        <a href={DISCORD_BOT_INVITE_URL + "&guild_id=" + guild.id} target="_blank" rel="noopener noreferrer">
                            <Button color="secondary" variant="contained">Invite</Button>
                        </a>
                    ) }
                </Grid>
            </Grid>
        </Paper>
    )
}

export default Guild