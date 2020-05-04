const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");

const client = new Discord.Client();
client.commands = new Discord.Collection();

// Commands handler
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const commandFunction = require(`./commands/${file}`);
    client.commands.set(commandFunction.name, commandFunction);
  });
});

// Events handler
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const eventFunction = require(`./events/${file}`);
    if (eventFunction.disabled) return;
    client.on(eventFunction.event, (...args) =>
      eventFunction.run(client, ...args)
    );
  });
});

client.login(process.env.DISCORD_TOKEN);
