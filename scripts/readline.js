const readline = require("readline")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function question(content) {
    return new Promise(resolve => rl.question(content, resolve))
}

(async () => {
    console.log(await question("Das ist eine Frage: "))

    rl.close()
})()