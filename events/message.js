module.exports = {
  disabled: false,
  event: "message",
  run(client, message) {
    if (message.author.bot) return;
    if (message.content.includes("!r/")) {
      client.commands.get("r").execute(message);
    } else if (message.content.startsWith("!poll")) {
      client.commands.get("poll").execute(message);
    } else if (message.content === "!stats") {
      client.commands.get("stats").execute(message);
    }
  },
};
