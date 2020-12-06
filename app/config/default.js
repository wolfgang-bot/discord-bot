const glob = require("glob-promise")
const path = require("path")

// Match unicode emojis
const EMOJI_REGEX = /([\ud800-\udbff])/
// Math hex colors
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}){1,2}$/
// Match hex colors and discord color names
const COLOR_REGEX = /^((#([0-9a-fA-F]{3}){1,2})|(DEFAULT|WHITE|AQUA|GREEN|BLUE|YELLOW|PURPLE|LUMINOUS_VIVID_PINK|GOLD|ORANGE|RED|GREY|DARKER_GREY|NAVY|DARK_AQUA|DARK_GREEN|DARK_BLUE|DARK_PURPLE|DARK_VIVID_PINK|DARK_GOLD|DARK_ORANGE|DARK_RED|DARK_GREY|LIGHT_GREY|DARK_NAVY|BLURPLE|GREYPLE|DARK_BUT_NOT_BLACK|NOT_QUITE_BLACK|RANDOM))$/

const APP_DIR = path.join(__dirname, "..")
const ICONS_DIR = path.join(APP_DIR, "assets", "icons")

// Get available icons from icons directory
const icons = glob.sync("*.png", { cwd: ICONS_DIR }).map(filename => filename.replace(".png", ""))

/**
 * Constraint templates
 */
const emojiConstraint = {
    constraints: "Must be a unicode emoji",
    verifyConstraints: (value) => EMOJI_REGEX.test(value) 
}

/**
 * Key names cannot contain the character: "#"
 * -> This is used in the frontend to create a flat object hirarchie
 */
module.exports = {
    userRole: {
        description: "Role each user receives when joining the guild",
        value: "User"
    },

    colors: {
        description: "Color theme of the bot (e.g. embeds)",
        value: {
            primary: {
                value: "#3f51b5",
                constraints: "Must be a valid hexadecimal color-code",
                verifyConstraints: (value) => HEX_COLOR_REGEX.test(value)
            }
        }
    },

    "dynamic-voicechannels": {
        value: {
            defaultChannels: {
                description: "Amount of persistant channels",
                value: 3
            },

            channelName: {
                description: "Template for the voice channel names ('{}' will be replaced with channels index)",
                value: "🔊┃voice {}"
            }
        }
    },

    "question-channels": {
        value: {
            channelName: {
                description: "Template for the question channel names ('{}' will be replaced by the author's username)",
                value: "❓┃{}"
            },

            resolveReaction: {
                description: "Name of the reaction a question's author has to give the to an answer to resolve the channel",
                value: "✅",
                ...emojiConstraint
            },

            deleteMessage: {
                description: "Content of the message a question's author has to sent into the question channel to delete it",
                value: "❌"
            },

            acceptReputation: {
                description: "Amount of reputation a user receives when his message is marked as the answer",
                value: 10
            },

            messageReputation: {
                description: "Amount of reputation a user receives when sending a message into a question channel",
                value: 1
            },

            messageReputationTimeout: {
                description: "Duration of the timeout a user receives for receiving points by sending a message into a question channel (in ms)",
                value: 7500
            },

            askChannelRateLimit: {
                description: "Duration of the rate limit the ask-channel receives when initializing the module",
                value: 300
            }
        }
    },

    "reputation-system": {
        value: {
            roles: {
                description: "Level Roles which are assigned to a user who reaches the level",
                value: ["Bronze", "Silber", "Gold", "Platin", "Diamant"],
                constraints: "Must have the same amount of items as 'Role Colors' and 'Role Thresholds'",
                verifyConstraints: (value, config) => (
                    value.length > 0 &&
                    value.length === config.roleColors.length &&
                    value.length === config.roleThresholds.length
                )
            },

            roleColors: {
                description: "Color of each level role",
                value: ["#E67E22", "#ffffff", "#F0C410", "#607d8b", "#3498DB"],
                constraints: "Must have the same amount of items as 'Roles' and 'Role Thresholds'",
                verifyConstraints: (value, config) => (
                    value.length > 0 &&
                    value.length === config.roles.length &&
                    value.length === config.roleThresholds.length
                )
            },

            roleThresholds: {
                description: "Amount of reputation needed to reach the levels",
                value: [10, 100, 500, 1000, 2500],
                constraints: "Must have the same amount of items as 'Roles' and 'Role Colors'",
                verifyConstraints: (value, config) => (
                    value.length > 0 &&
                    value.length === config.roles.length &&
                    value.length === config.roleColors.length
                )
            },

            levelUpReactionEmoji: {
                description: "Emoji of the reaction which is added to the 'level up' announcements",
                value: "💯",
                ...emojiConstraint
            }
        }
    },

    "skill-roles": {
        value: {
            emojiPrefix: {
                description: "Prefix of the role names",
                value: "skill_"
            },

            roleColor: {
                description: "Color of the roles (Discord color names allowed)",
                value: "AQUA",
                constraints: "Must be a valid color",
                verifyConstraints: (value) => COLOR_REGEX.test(value)
            },
            
            roles: {
                description: "Names of the roles which will be created",
                value: [
                    "Javascript",
                    "Python",
                    "React",
                    "Vue",
                    "Angular",
                    "Linux",
                    "Java",
                    "Cpp"
                ],
                constraints: `Available roles: ${icons.map(e => `'${e}'`).join(", ")}`,
                verifyConstraints: (value) => (
                    value.length > 0 &&
                    value.every(name => icons.includes(name.toLowerCase()))
                )
            }
        }
    },
}