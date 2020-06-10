const dynamodb = require("../utility/dynamodb");
const moment = require("moment");

module.exports = {
  disabled: false,
  event: "presenceUpdate",
  run(client, oldPresence, newPresence) {
    const ignore = ["Spotify"];
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
        // console.log();
        // console.log("old Presence", JSON.parse(oldPresenceString));
        // console.log("new Presence", JSON.parse(newPresenceString));

        // When the newPresence is the same as the oldPresence
        // There will not be a "new" activity, or an "old" one, they are both the same
        const newActivity = JSON.parse(
          newPresenceString.filter((x) => !oldPresenceString.includes(x))[0]
        );

        const oldActivity = JSON.parse(
          oldPresenceString.filter((x) => !newPresenceString.includes(x))[0]
        );

        console.log(
          `${moment().format("YYYY-MM-DD HH:mm")} ${
            newPresence.member.user.username
          } updated ${newActivity.name}`
        );
        if (
          oldActivity.name === newActivity.name &&
          !ignore.includes(oldActivity.name)
        ) {
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
        console.log(
          `${moment().format("YYYY-MM-DD HH:mm")} ${
            newPresence.member.user.username
          } started ${activity}`
        );
        if (!ignore.includes(activity)) {
          dynamodb.saveItem({
            userId: newPresence.user.id,
            createdTimestamp: newActivity.createdTimestamp,
            activity,
          });
        }
      } else {
        const oldActivity = JSON.parse(
          oldPresenceString.filter((x) => !newPresenceString.includes(x))[0]
        );

        const activity = oldActivity.name;
        console.log(
          `${moment().format("YYYY-MM-DD HH:mm")} ${
            oldPresence.member.user.username
          } ended ${activity}`
        );
        if (!ignore.includes(activity)) {
          dynamodb.updateItem(
            oldPresence.user.id,
            oldActivity.createdTimestamp,
            "endedTimestamp",
            Date.now()
          );
        }
      }
    }
  },
};
