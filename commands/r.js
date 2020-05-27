const snoowrap = require("snoowrap");
const r = new snoowrap({
  userAgent: "Suh",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});

const visited = {};
const cache = {};
module.exports = {
  name: "r",
  async execute(message) {
    let query = /!r\/(\w+)/i.exec(message.content);
    query = query ? query[1] : "";
    try {
      const post = await getPosts(query);

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
    } catch (err) {
      console.log(err);
      message.channel.send(`Sorry, I couldn't find any posts in r/${query}`);
    }
  },
};

async function getPosts(query, lastSeenId = null) {
  // Check cache
  if (query in cache) {
    const cachedPosts = cache[query].newPosts;
    // If cache is empty, get new posts
    if (cachedPosts.length > 0) {
      // If cache is stale, get new posts
      if (Date.now() - cache[query].time < 3600000) {
        const cachedPost = cachedPosts.shift();
        cache[query].newPosts = cachedPosts;
        visited[cachedPost.name] = 1;
        return cachedPost;
      }
    }
  }

  const post = await r.getHot(query, { limit: 5, after: lastSeenId });
  const newPosts = post.filter(
    (p) => !(p.name in visited) && !p.pinned && !p.stickied
  );
  if (newPosts.length == 0) {
    lastSeenId = post[post.length - 1].name;
    return await getPosts(query, lastSeenId);
  } else {
    const newPost = newPosts.shift();
    cache[query] = { newPosts, time: Date.now() };
    visited[newPost.name] = 1;
    return newPost;
  }
}
