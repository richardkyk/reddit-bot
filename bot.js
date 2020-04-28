const Discord = require("discord.js");
const config = require("./config.json");
const credentials = require("./credentials.json");
const snoowrap = require("snoowrap");

const r = new snoowrap({ ...credentials });
const devId = "692650070956310568";
const stoveId = "166136330345119744";

const client = new Discord.Client();
client.once("ready", () => {
  console.log("Ready!");
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
      console.log(post);

      visited[query].push(post.name);

      console.log(visited);
      if (post.over_18) {
        message.channel.send({ content: `${post.title}\n|| ${post.url} ||` });
      } else {
        message.channel.send({ content: `${post.title}\n${post.url}` });
      }
    } catch {
      message.channel.send(`Couldn't find subreddit r/${query}`);
    }
  } else if (message.content === prefix + "user-info") {
    message.channel.send(
      "Your username: " +
        message.author.username +
        "\nYour ID: " +
        message.author.id
    );
  }
});

client.login(config.token);
