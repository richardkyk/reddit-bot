const credentials = require("../credentials.json");
const snoowrap = require("snoowrap");
const r = new snoowrap({ ...credentials });

const visited = {};
module.exports = {
  name: "r",
  async execute(message) {
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
  },
};
