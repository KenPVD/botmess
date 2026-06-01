module.exports = {

name: "/reload",

run: async function(api, event) {

    global.loadCommands();

    api.sendMessage(
        "✅ Reload thành công!",
        event.threadID
    );

}

};