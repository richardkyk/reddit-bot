const dynamodb = require("../utility/dynamodb");

module.exports = {
  disabled: false,
  event: "ready",
  run(client) {
    console.log("Ready!");
    // client.user.setPresence({
    //   status: "online",
    //   activity: { name: "with my pp" },
    // });
    client.guilds.cache
      .get(process.env.DISCORD_GUILD)
      .presences.cache.forEach((user) => {
        for (activity of user.activities) {
          dynamodb.saveItem({
            userId: user.userID,
            createdTimestamp: activity.createdTimestamp,
            activity: activity.name,
          });
        }
      });
  },
};
