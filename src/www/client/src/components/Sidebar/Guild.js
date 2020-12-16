import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import { ListItem, ListItemText, ListItemIcon } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import GuildIcon from "./GuildIcon.js"

const useStyles = makeStyles(theme => ({
    guild: {
        padding: theme.spacing(2),
        maxWidth: 600,
        width: "100%"
    }
}))

function Guild({ guild }) {
    const classes = useStyles()

    const history = useHistory()

    const [isMouseOver, setIsMouseOver] = useState(false)

    const handleClick = () => {
        history.push("/guild/" + guild.id)
    }

    return (
        <ListItem
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
            button
            onClick={handleClick}
        >
            <ListItemIcon><GuildIcon guild={guild} animated={isMouseOver}/></ListItemIcon>

            <ListItemText>{ guild.name }</ListItemText>
        </ListItem>
    )
}

export default Guild