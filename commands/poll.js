module.exports = {
  name: "poll",
  async execute(message) {
    let data = message.content.replace("!poll", "").replace("?", "").split("|");
    data = data.map((x) => x.trim().toTitleCase()).filter((x) => x != "");
    if (data.length > 0) {
      const question = `${data.shift()}?`;
      if (data.length == 0) {
        // Yes or no question
        const emojiNo = message.guild.emojis.cache.find(
          (emoji) => emoji.name === "7685_no"
        );
        const emojiYes = message.guild.emojis.cache.find(
          (emoji) => emoji.name === "2990_yes"
        );
        msg = await message.channel.send(`**${question}**`);
        await msg.react(emojiNo);
        await msg.react(emojiYes);
      } else {
        const colours = ["🟦", "🟪", "🟫", "🟥", "🟧", "🟨", "🟩"].sort(
          (a, b) => 0.5 - Math.random()
        );
        data = data.slice(0, colours.length);
        const options = [];
        for (let i = 0; i < data.length; i++) {
          options.push(`${colours[i]} ${data[i]}`);
        }
        msg = await message.channel.send(
          `**${question}**\n${options.join("\n")}`
        );

        for (let i = 0; i < data.length; i++) {
          await msg.react(colours[i]);
        }
      }
    } else {
      message.channel.send(
        `**You didn't provide any arguments**.\nExample:\n!poll *Question*|*Option 1*|*Option 2*\n!poll *Question*`
      );
    }
  },
};

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

String.prototype.toTitleCase = function () {
  return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
};
