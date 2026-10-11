const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const token = process.env.TELEGRAM_TOKEN;
const openrouterKey = process.env.OPENROUTER_KEY;

const bot = new TelegramBot(token, { polling: true });

console.log("OpenClaw Telegram Botu Başlatıldı...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start')) {
    return bot.sendMessage(chatId, "👋 Merhaba! Ben OpenClaw altyapılı ücretsiz yapay zeka botun. Sorunu sorabilirsin!");
  }

  bot.sendChatAction(chatId, 'typing');

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.3-70b-instruct:free",
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
