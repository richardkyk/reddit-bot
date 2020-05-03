const Discord = require("discord.js");
const config = require("./config.json");
const credentials = require("./credentials.json");
const snoowrap = require("snoowrap");
const dynamodb = require("./GameActivity");
const fs = require("fs");

const r = new snoowrap({ ...credentials });
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log("Ready!");
  // client.user.setPresence({
  //   status: "online",
  //   activity: { name: "with my pp" },
  // });
  client.guilds.cache.get(config.guild).presences.cache.forEach((user) => {
    for (activity of user.activities) {
      dynamodb.saveItem({
        userId: user.userID,
        createdTimestamp: activity.createdTimestamp,
        activity: activity.name,
      });
    }
  });
});

const { prefix } = config;

const visited = {};

client.on("message", async (message) => {
  if (message.content.includes("!r/")) {
    let lastSeenId = null;
    let query = /!r\/(\w+)/i.exec(message.content);
    query = query ? query[1] : "";
    try {
      if (query in visited) {
        lastSeenId = visited[query].slice(-1)[0];
      } else {
        visited[query] = [];
      }

      let post = await r.getHot(query, { limit: 1, after: lastSeenId });
      post = post[post.length - 1];

      visited[query].push(post.name);

      console.log(visited);

      if (post.over_18) {
        if (message.channel.nsfw) {
          message.channel.send({ content: `${post.title}\n${post.url}` });
        } else {
          message.channel.send({ content: `${post.title}\n|| ${post.url} ||` });
          // message.channel.send(`Sorry, I can't post that here`);
        }
      } else {
        message.channel.send({ content: `${post.title}\n${post.url}` });
      }
    } catch {
      message.channel.send(`Sorry, I couldn't find any posts in r/${query}`);
    }
  } else if (message.content.startsWith("!poll")) {
    client.commands.get("poll").execute(message);
  } else if (message.content === prefix + "stats") {
    client.commands.get("stats").execute(message);
  }
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
  const oldPresenceString = oldPresence
    ? oldPresence.activities.map((x) => JSON.stringify(x))
    : [];

  const newPresenceString = newPresence
    ? newPresence.activities.map((x) => JSON.stringify(x))
    : [];

  if (oldPresenceString.length === newPresenceString.length) {
    if (
      oldPresenceString.length !== 0 &&
      oldPresenceString.toString() !== newPresenceString.toString()
    ) {
      console.log();
      console.log("old Presence", JSON.parse(oldPresenceString));
      console.log("new Presence", JSON.parse(newPresenceString));
      // There is a bug here
      // When the newPresence is the same as the oldPresence
      // There will not be a "new" activity, or an "old" one, they are both the same
      const newActivity = JSON.parse(
        newPresenceString.filter((x) => !oldPresenceString.includes(x))[0]
      );

      const oldActivity = JSON.parse(
        oldPresenceString.filter((x) => !newPresenceString.includes(x))[0]
      );

      if (oldActivity.name === newActivity.name) {
        console.log(
          `${newPresence.member.user.username} updated ${newActivity.name}`
        );
        dynamodb.updateItem(
          oldPresence.user.id,
          oldActivity.createdTimestamp,
          "endedTimestamp",
          Date.now()
        );

        dynamodb.saveItem({
          userId: newPresence.user.id,
          createdTimestamp: newActivity.createdTimestamp,
          activity: newActivity.name,
        });
      }
    }
  } else {
    if (newPresenceString.length > oldPresenceString.length) {
      const newActivity = JSON.parse(
        newPresenceString.filter((x) => !oldPresenceString.includes(x))[0]
      );

      const activity = newActivity.name;
      console.log(`${newPresence.member.user.username} started ${activity}`);
      dynamodb.saveItem({
        userId: newPresence.user.id,
        createdTimestamp: newActivity.createdTimestamp,
        activity,
      });
    } else {
      const oldActivity = JSON.parse(
        oldPresenceString.filter((x) => !newPresenceString.includes(x))[0]
      );

      const activity = oldActivity.name;
      console.log(`${oldPresence.member.user.username} ended ${activity}`);
      dynamodb.updateItem(
        oldPresence.user.id,
        oldActivity.createdTimestamp,
        "endedTimestamp",
        Date.now()
      );
    }
  }
});
client.login(config.token);
