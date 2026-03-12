require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// =========================
// COMMAND IMAGE SYSTEM
// =========================
const commandImages = {
  "!gm": "gm.png",
  "!ge": "ge.png",
  "!gn": "gn.png",
  "!happy valentines": "Happy Valentine's.png",
  "!happy birthday": "happy birthday.png"
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const cmd = message.content.toLowerCase().trim();

  if (commandImages[cmd]) {
    const filePath = path.join(__dirname, "assets", "commands", commandImages[cmd]);

    if (fs.existsSync(filePath)) {
      const file = new AttachmentBuilder(filePath);
      await message.channel.send({ files: [file] });
    } else {
      await message.reply("Không tìm thấy ảnh cho lệnh này.");
    }
  }
});

// =========================
// WELCOME IMAGE SYSTEM
// =========================
const welcomeImages = [
  "welcome1.png",
  "welcome2.png"
];

function getRandomWelcomeImage() {
  return welcomeImages[Math.floor(Math.random() * welcomeImages.length)];
}

async function createWelcomeCard(member) {
  const randomImage = getRandomWelcomeImage();
  const backgroundPath = path.join(__dirname, "assets", "welcome", randomImage);

  if (!fs.existsSync(backgroundPath)) {
    throw new Error(`Không tìm thấy background: ${randomImage}`);
  }

  const background = await loadImage(backgroundPath);

  // Kích thước canvas theo ảnh nền
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");

  // Vẽ background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Lấy avatar user
  const avatarURL = member.user.displayAvatarURL({
    extension: "png",
    size: 256
  });

  const avatar = await loadImage(avatarURL);

  // ====== CHỈNH vị trí avatar ở giữa ======
  const avatarSize = Math.floor(canvas.height * 0.32); // to/nhỏ
  const avatarX = Math.floor((canvas.width - avatarSize) / 2);
  const avatarY = Math.floor(canvas.height * 0.17);

  // Viền trắng tròn ngoài avatar
  const borderSize = 8;
  const centerX = avatarX + avatarSize / 2;
  const centerY = avatarY + avatarSize / 2;
  const radius = avatarSize / 2;

  ctx.save();

  // Vẽ vòng tròn trắng
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + borderSize, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Cắt avatar thành hình tròn
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // ====== TEXT tên user ======
  const username = member.user.username;

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  // Viền đen cho chữ
  ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
  ctx.lineWidth = 6;

  const nameY = avatarY + avatarSize + 70;
  const subY = nameY + 45;

  ctx.font = "bold 42px sans-serif";
  ctx.strokeText(`${username} just joined the server`, canvas.width / 2, nameY);
  ctx.fillText(`${username} just joined the server`, canvas.width / 2, nameY);

  ctx.font = "28px sans-serif";
  ctx.strokeText(`Member #${member.guild.memberCount}`, canvas.width / 2, subY);
  ctx.fillText(`Member #${member.guild.memberCount}`, canvas.width / 2, subY);

  return canvas.toBuffer("image/png");
}

client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);

    if (!channel) {
      console.log("WELCOME CHANNEL NOT FOUND");
      return;
    }

    const buffer = await createWelcomeCard(member);
    const file = new AttachmentBuilder(buffer, { name: "welcome-card.png" });

    await channel.send({
      content: `Hey! ${member}, welcome to **Taste of Disgrace**!`,
      files: [file]
    });
  } catch (error) {
    console.error("WELCOME ERROR:", error);
  }
});

// =========================
// READY
// =========================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
