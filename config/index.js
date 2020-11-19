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
        acceptReputation: 10
    },

    reputationSystem: {
        roles: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
        initialRoleColor: [2/3, 1, 0], // HSL
        // roleThresholds: [50, 150, 500, 1000, 2500]
        roleThresholds: [10, 20, 30, 40, 50] // n[i] < n[i+1]; |roleThresholds| = |roles|
    }
}