import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import { ListItem, ListItemText, ListItemIcon } from "@material-ui/core"

import GuildIcon from "../Discord/GuildIcon.js"
import { DISCORD_BOT_INVITE_URL } from "../../config/constants.js"


function Guild({ guild, active = false }) {
    const history = useHistory()

    const [isMouseOver, setIsMouseOver] = useState(false)

    const handleClick = () => {
        if (!guild.active) {
            window.open(DISCORD_BOT_INVITE_URL + "&guild_id=" + guild.id, "_blank", "noopener,noreferrer")
        } else {
            history.push("/guild/" + guild.id)
        }
    }

    return (
        <ListItem
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
            button
            onClick={handleClick}
            selected={active}
        >
            <ListItemIcon><GuildIcon guild={guild} animated={isMouseOver}/></ListItemIcon>

            <ListItemText>{ guild.name }</ListItemText>
        </ListItem>
    )
}

export default Guild