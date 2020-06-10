const dynamodb = require("../utility/dynamodb");
const moment = require("moment");

module.exports = {
  disabled: false,
  event: "ready",
  run(client) {
    console.log(`${moment().format("YYYY-MM-DD HH:mm")} Ready!`);
    // client.user.setPresence({
    //   status: "online",
    //   activity: { name: "with my pp" },
    // });
    ignore = ["Spotify"];
    client.guilds.cache
      .get(process.env.DISCORD_GUILD)
      .presences.cache.forEach((user) => {
        for (activity of user.activities) {
          if (!activity in ignore) {
            dynamodb.saveItem({
              userId: user.userID,
              createdTimestamp: activity.createdTimestamp,
              activity: activity.name,
            });
          }
        }
      });
  },
};
