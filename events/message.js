const config = require("../config.json");
const { prefix } = config;

module.exports = {
  disabled: false,
  event: "message",
  run(client, message) {
    if (message.content.includes("!r/")) {
      client.commands.get("r").execute(message);
    } else if (message.content.startsWith("!poll")) {
      client.commands.get("poll").execute(message);
    } else if (message.content === prefix + "stats") {
      client.commands.get("stats").execute(message);
    }
  },
};
