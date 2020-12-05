import React from "react"
import { CircularProgress } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import useAPIData from "../../utils/useAPIData.js"
import Guild from "../Discord/Guild.js"

const useStyles = makeStyles(theme => ({
    guild: {
        marginBottom: theme.spacing(2)
    }
}))

function Guilds() {
    const classes = useStyles()

    const { data, isLoading } = useAPIData("getGuilds")

    if (isLoading) {
        return <CircularProgress/>
    }

    return data.map(guild => <Guild guild={guild} className={classes.guild} key={guild.id}/>)
}

export default Guilds