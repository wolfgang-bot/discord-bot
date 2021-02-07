import emojiRegex from "emoji-regex/RGI_Emoji.js"

// Match hex colors
export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}){1,2}$/
// Match hex colors and discord color names
export const COLOR_REGEX = /^((#([0-9a-fA-F]{3}){1,2})|(DEFAULT|WHITE|AQUA|GREEN|BLUE|YELLOW|PURPLE|LUMINOUS_VIVID_PINK|GOLD|ORANGE|RED|GREY|DARKER_GREY|NAVY|DARK_AQUA|DARK_GREEN|DARK_BLUE|DARK_PURPLE|DARK_VIVID_PINK|DARK_GOLD|DARK_ORANGE|DARK_RED|DARK_GREY|LIGHT_GREY|DARK_NAVY|BLURPLE|GREYPLE|DARK_BUT_NOT_BLACK|NOT_QUITE_BLACK|RANDOM))$/

export const emojiConstraint = {
    constraints: "Must be one unicode emoji",
    verifyConstraints: (value: string) =>
        emojiRegex().test(value) &&
        value.match(emojiRegex()).length === 1
}
