const Discord = require("discord.js");
const config = require("./config.json");
const credentials = require("./credentials.json");
const snoowrap = require("snoowrap");
const dynamodb = require("./GameActivity");
const { table } = require("table");

const r = new snoowrap({ ...credentials });
const devId = "692650070956310568";
const stoveId = "166136330345119744";

const client = new Discord.Client();
client.once("ready", () => {
  console.log("Ready!");
  client.user.setPresence({
    status: "online",
    activity: { name: "with my pp" },
  });
  client.guilds.cache.get(stoveId).presences.cache.forEach((user) => {
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
  } else if (message.content === prefix + "user-info") {
    message.channel.send(
      "Your username: " +
        message.author.username +
        "\nYour ID: " +
        message.author.id
    );
  } else if (message.content === prefix + "stats") {
    const data = await dynamodb.getItems(message.author.id);
    const results = {};
    if (data.length > 0) {
      data.forEach((activity) => {
        if (activity.endedTimestamp) {
          if (activity.activity in results) {
            results[activity.activity] +=
              activity.endedTimestamp - activity.createdTimestamp;
          } else {
            results[activity.activity] =
              activity.endedTimestamp - activity.createdTimestamp;
          }
        }
      });

      const output = [];
      for (let [key, value] of Object.entries(results)) {
        output.push([key, value]);
      }
      output.sort(function (a, b) {
        return b[1] - a[1];
      });

      const username = message.member.toString();
      const outputTable = [["Activity", "Duration"]];
      for ([key, value] of output) {
        outputTable.push([key, new Date(value).toISOString().substr(11, 8)]);
      }

      if (outputTable.length == 1) {
        message.channel.send(
          `Sorry, I couldn't find any statistics on record for ${username}`
        );
      } else {
        message.channel.send(`${username}\n\`\`\`${table(outputTable)}\`\`\``);
      }
    } else {
      const username = message.member.toString();
      message.channel.send(
        `Sorry, I couldn't find any statistics on record for ${username}`
      );
    }
  }
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
  console.log("old", oldPresence);
  console.log("new", newPresence);
  const oldPresenceString = oldPresence.activities.map((x) =>
    JSON.stringify(x)
  );
  console.log("oldString", oldPresenceString);
  const newPresenceString = newPresence.activities.map((x) =>
    JSON.stringify(x)
  );
  console.log("newString", newPresenceString);

  if ((oldPresenceString.length === newPresenceString.length) !== 0) {
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
