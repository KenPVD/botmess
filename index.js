const login = require("@dongdev/fca-unofficial");
const fs = require("fs");

const appState = JSON.parse(
  fs.readFileSync("./appstate.json", "utf8")
);

const commands = {};

const ADMINS = [
  "61590260273861"
];

function loadCommands() {

  const files = fs
    .readdirSync("./commands")
    .filter(file => file.endsWith(".js"));

  for (const key in commands) {
    delete commands[key];
  }

  for (const file of files) {

    delete require.cache[
      require.resolve("./commands/" + file)
    ];

    const cmd =
      require("./commands/" + file);

    commands[
      cmd.name.toLowerCase()
    ] = cmd;

  }

  console.log(
    `Đã load ${Object.keys(commands).length} commands`
  );

}

global.loadCommands = loadCommands;

loadCommands();

console.log("Đang login...");

login(
  {
    appState,
    forceLogin: false
  },

  (err, api) => {

    if (err) {
      console.log("LOGIN ERROR:");
      return console.log(err);
    }

    console.log("LOGIN THÀNH CÔNG");
    console.log(
      "UID:",
      api.getCurrentUserID()
    );

    api.setOptions({
      selfListen: false,
      listenEvents: true,
      updatePresence: false
    });

    api.listenMqtt(
      async (err, event) => {

        if (err) {
          console.log(err);
          return;
        }

        if (!event) return;

        try {

          if (event.logMessageType) {

            if (commands["joinleave"]) {
              commands["joinleave"].run(
                api,
                event
              );
            }

            if (commands["/antibox"]) {
              commands["/antibox"].run(
                api,
                event,
                []
              );
            }

          }

          if (!event.body) return;

          const args =
            event.body.trim().split(" ");

          const cmd =
            args[0].toLowerCase();

          const adminOnly = [
            "/reload",
            "/antibox"
          ];

          if (
            adminOnly.includes(cmd) &&
            !ADMINS.includes(
              event.senderID
            )
          ) {

            return api.sendMessage(
              "❌ Chỉ admin bot mới dùng được!",
              event.threadID
            );

          }

          if (commands[cmd]) {

            await commands[cmd].run(
              api,
              event,
              args
            );

          }

        } catch (e) {

          console.log(e);

        }

      }
    );

  }
);