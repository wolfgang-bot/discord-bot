import React from "react"
import { Avatar } from "@material-ui/core"

function GuildIcon({ guild, animated }) {
    return guild.icon_url ? (
        <Avatar src={!animated ? guild.icon_url : guild.icon_url_animated}/>
    ) : (
        <Avatar>{guild.name.substr(0, 1)}</Avatar>
    )
}
export default GuildIcon