const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const http = require('http');

// Render'ın kapanmaması ve port hatası vermemesi için mini web sunucusu
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OpenClaw Bot Aktif!\n');
}).listen(port, () => {
  console.log(`Port ${port} dinleniyor...`);
});

const token = process.env.TELEGRAM_TOKEN;
const groqApiKey = process.env.GROQ_API_KEY;

const bot = new TelegramBot(token, { polling: true });

console.log("Groq destekli OpenClaw Botu Işık Hızında Başlatıldı...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start')) {
    return bot.sendMessage(chatId, "⚡ Merhaba! Ben Groq altyapısıyla ışık hızında çalışan yapay zeka botun. Sorunu sorabilirsin!");
  }

  bot.sendChatAction(chatId, 'typing');

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "llama-3.3-70b-versatile",
        "messages": [
          { "role": "system", "content": "Sen OpenClaw altyapısıyla çalışan, çok akıllı, yardımsever ve Türkçe konuşan bir yapay zeka asistanısın." },
          { "role": "user", "content": text }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const reply = data.choices[0].message.content;
      bot.sendMessage(chatId, reply);
    } else {
      bot.sendMessage(chatId, "⚠️ Modelden yanıt alınamadı, lütfen tekrar dene.");
    }
  } catch (error) {
    console.error("Hata:", error);
    bot.sendMessage(chatId, "❌ Bir hata oluştu.");
  }
});
