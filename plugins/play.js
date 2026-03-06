import axios from "axios";
import yts from "yt-search";
import { Module } from "../lib/plugins.js";

const HECTOR_API = "https://yt-dl.officialhectormanuel.workers.dev/";

Module({
  command: "play",
  package: "downloader",
  description: "Play song from YouTube (API based)",
})(async (message, match) => {
  try {
    if (!match) {
      return message.send("❌ Song name dao\n\n.play love nwantiti");
    }

    await message.react("🔍");

    // 1️⃣ YouTube search
    const res = await yts(match);
    if (!res.videos || res.videos.length === 0) {
      return message.send("❌ Kono video paoa jay nai");
    }

    const video = res.videos[0];

    // 2️⃣ Call Hector API with YouTube URL
    const { data } = await axios.get(HECTOR_API, {
      params: { url: video.url },
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!data?.status || !data?.audio) {
      return message.send("❌ Audio download failed");
    }

    // 3️⃣ Caption
    const caption = `
🎵 *Now Playing*

𝙼𝙰𝙳𝙴 𝙸𝙽 𝙱𝚈 𝙸𝙽𝙲𝙾𝙽𝙽𝚄 𝙱𝙾𝚈

📌 *Title:* ${data.title || video.title}
👤 *Channel:* ${video.author.name}
⏱️ *Duration:* ${video.timestamp}

⬇️ *Downloading audio...*
`.trim();

    // 4️⃣ Send Now Playing message with thumbnail
    const opts = {
      image: { url: data.thumbnail || video.thumbnail },
      caption: caption,
      mimetype: "image/jpeg",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363403408693274@newsletter",
          newsletterName: "𝙼𝙸𝙽𝙸 𝙸𝙽𝙲𝙾𝙽𝙽𝚄 𝚇𝙳",
          serverMessageId: 6,
        },
      },
    };

    await message.send(opts);

    // 5️⃣ Send audio
    await message.send({
      audio: { url: data.audio },
      mimetype: "audio/mpeg",
      fileName: `${(data.title || video.title).replace(/[<>:"\/\\|?*]+/g, "")}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: data.title || video.title,
          body: "𝙼𝙰𝙳𝙴 𝙸𝙽 𝙱𝚈 𝙸𝙽𝙲𝙾𝙽𝙽𝚄 𝙱𝙾𝚈",
          mediaType: 2,
          sourceUrl: video.url,
          thumbnailUrl: data.thumbnail || video.thumbnail,
        },
      },
    });

    await message.react("🎧");

  } catch (err) {
    console.error("[PLAY ERROR]", err);
    await message.react("❌");
    await message.send("⚠️ Play failed. Try again.");
  }
});
