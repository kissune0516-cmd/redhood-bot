require('dotenv').config();
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});


// =============================
// COMMAND IMAGE SYSTEM
// =============================

const commandImages = {
  "!gm": "gm.png",
  "!ge": "ge.png",
  "!gn": "gn.png",
  "!happy valentines": "Happy Valentine's.png",
  "!happy birthday": "happy birthday.png"
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const cmd = message.content.toLowerCase();

  if (commandImages[cmd]) {
    const filePath = path.join(__dirname, "assets", "commands", commandImages[cmd]);

    if (fs.existsSync(filePath)) {
      const file = new AttachmentBuilder(filePath);
      await message.channel.send({ files: [file] });
    } else {
      message.reply("Không tìm thấy ảnh cho lệnh này.");
    }
  }
});


// =============================
// RANDOM WELCOME IMAGE
// =============================

const welcomeImages = [
  "welcome1.png",
  "welcome2.png"
];

client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (!channel) return;

  const randomImage = welcomeImages[Math.floor(Math.random() * welcomeImages.length)];
  const filePath = path.join(__dirname, "assets", "welcome", randomImage);

  if (fs.existsSync(filePath)) {
    const file = new AttachmentBuilder(filePath);
    await channel.send({
      content: `✨ Welcome ${member} to the server!`,
      files: [file]
    });
  }
});


// =============================

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
