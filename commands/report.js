const reports = {};

module.exports = {
  name: "report",
  async execute(message) {
    const data = message.content.split(" ");
    if (data.length <= 1) {
      message.channel.send(
        `**You didn't provide any arguments**.\nExample:\n!report @username\n!report abc123`
      );
      return;
    }

    if (data[1].includes("<@!")) {
      const memberId = /!report <@!(\d+)>/i.exec(message.content)[1];

      const memberIds = Array.from(message.guild.members.cache.keys());

      if (memberIds.includes(memberId)) {
        const reportId = generateUID();
        reports[reportId] = {
          id: reportId,
          offender: memberId,
          time: new Date().toString(),
          reporter: message.author.id,
          status: "Under investigation",
        };

        const role = message.guild.roles.cache.find(
          (guild) => guild.name == "Reported"
        );
        message.guild
          .member(memberId)
          .roles.add(role)
          .catch((err) => console.log(err));
        message.channel.send(
          `Case ID: **${reportId}**\nYour report for <@!${memberId}> has been submitted.\nThank you for your contribution to the community.`
        );
      }
    } else if (data[1] in reports) {
      const reportId = data[1];
      message.channel.send(
        `Time: ${reports[reportId].time}\nCase ID: ${reports[reportId].id}\nStatus: ${reports[reportId].status}\nOffender: <@!${reports[reportId].offender}>\nReporter: <@!${reports[reportId].reporter}>`
      );
    } else {
      message.channel.send(
        `Sorry, I couldn't find member/case-id: "${data[1]}".`
      );
    }
  },
};

function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}
