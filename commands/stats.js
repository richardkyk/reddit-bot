const dynamodb = require("../utility/dynamodb");
const { table } = require("table");
const moment = require("moment");

module.exports = {
  name: "stats",
  async execute(message) {
    const data = await dynamodb.getItems(message.author.id);
    const results = {};
    const oneWeekTimestamp = moment().subtract(1, "weeks").valueOf();

    if (data.length > 0) {
      data.forEach((activity) => {
        if (activity.endedTimestamp) {
          if (activity.activity in results) {
            results[activity.activity].all +=
              activity.endedTimestamp - activity.createdTimestamp;
            results[activity.activity].pastWeek +=
              activity.createdTimestamp >= oneWeekTimestamp
                ? activity.endedTimestamp - activity.createdTimestamp
                : 0;
          } else {
            results[activity.activity] = {
              all: activity.endedTimestamp - activity.createdTimestamp,
              pastWeek:
                activity.createdTimestamp >= oneWeekTimestamp
                  ? activity.endedTimestamp - activity.createdTimestamp
                  : 0,
            };
          }
        }
      });
      const output = [];
      for (let [key, value] of Object.entries(results)) {
        output.push([key, value]);
      }
      output.sort(function (a, b) {
        return b[1].pastWeek - a[1].pastWeek;
      });

      const username = message.member.toString();
      const outputTable = [["Activity", "Past Week", "Total"]];
      for ([key, value] of output) {
        outputTable.push([
          key,
          convertTime(Math.floor(~~(value.pastWeek / 1000))),
          convertTime(Math.floor(~~(value.all / 1000))),
        ]);
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
  },
};

function convertTime(sec) {
  if (sec == 0) return "";
  var hours = Math.floor(sec / 3600);
  hours >= 1 ? (sec = sec - hours * 3600) : (hours = "00");
  var min = Math.floor(sec / 60);
  min >= 1 ? (sec = sec - min * 60) : (min = "00");
  sec < 1 ? (sec = "00") : void 0;

  hours.toString().length == 1 ? (hours = "0" + hours) : void 0;
  min.toString().length == 1 ? (min = "0" + min) : void 0;
  sec.toString().length == 1 ? (sec = "0" + sec) : void 0;

  return hours + ":" + min + ":" + sec;
}
