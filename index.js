const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const http = require('http');

// Render mecburi HTTP sunucusu
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OpenClaw Bot Aktif!\n');
}).listen(port, () => {
  console.log(`Port ${port} dinleniyor...`);
});

const token = process.env.TELEGRAM_TOKEN;
const groqApiKey = process.env.GROQ_API_KEY;

const bot = new TelegramBot(token, { 
  polling: {
    autoStart: true,
    params: { timeout: 10 }
  } 
});

// Hatayı sessizce yutup botun sürekli açık kalmasını sağlayan zırh
bot.on('polling_error', (error) => {
  // Polling hatalarını konsola yazıp geçiyoruz, bot kapanmayacak
  console.log("Bağlantı durumu:", error.message || error);
});

console.log("OpenClaw Bot Işık Hızında Başlatıldı...");

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
        "model": "openai/gpt-oss-20b",
        "messages": [
          { "role": "system", "content": "Sen OpenClaw altyapısıyla çalışan, çok akıllı, son derece hızlı ve Türkçe konuşan bir yapay zeka asistanısın." },
          { "role": "user", "content": text }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const reply = data.choices[0].message.content;
      bot.sendMessage(chatId, reply);
    } else if (data.error) {
      bot.sendMessage(chatId, `⚠️ Yapay Zeka Hatası: ${data.error.message}`);
    } else {
      bot.sendMessage(chatId, "⚠️ Beklenmeyen bir yanıt alındı.");
    }
  } catch (error) {
    console.error("Fetch Hatası:", error);
    bot.sendMessage(chatId, "❌ Bağlantı hatası oluştu.");
  }
});
