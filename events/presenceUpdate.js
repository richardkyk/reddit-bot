const dynamodb = require("../utility/dynamodb");

module.exports = {
  disabled: false,
  event: "presenceUpdate",
  run(client, oldPresence, newPresence) {
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
  },
};
