import React from "react"
import { useHistory } from "react-router-dom"
import { useSelector } from "react-redux"
import { Avatar as MuiAvatar } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
    avatar: {
        cursor: props => !props.notClickable && "pointer",
        width: props => props.size,
        height: props => props.size
    }
}))

function Avatar({ size }) {
    const classes = useStyles({ size })

    const history = useHistory()

    const user = useSelector(store => store.auth.user)

    const handleClick = () => {
        history.push("/profile")
    }

    return (
        <MuiAvatar className={classes.avatar} onClick={handleClick} src={user.avatar_url} />
    )
}

export default Avatar