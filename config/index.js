module.exports = {
    colors: {
        primary: "#3f51b5"
    },

    dynamicVoicechannels: {
        defaultChannels: 3,
        channelName: "Voice {}"
    },

    questionChannels: {
        channelName: "❓┃{}",
        resolveReaction: ":white_check_mark:",
        resolveReactionName: "✅",
        acceptReputation: 10,
        messageReputation: 1
    },

    reputationSystem: {
        roles: ["Anfänger", "Fortgeschrittener", "Experte", "Profi", "Gott"],
        roleArticles: ["ein", "ein", "ein", "ein", "ein"],
        initialRoleColor: [2/3, 1, 0], // HSL
        roleThresholds: [10, 100, 500, 1000, 2500], // n[i] < n[i+1]; |roleThresholds| = |roles|,
        levelUpReactionEmoji: "💯"
    }
}