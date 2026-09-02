const express = require('express');
const app = express();

// Включаем обязательную поддержку чтения POST-данных формы, которую шлет Java
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api', async (req, res) => {
    // Включаем заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Достаем скрытые параметры
    const token = req.body?.token;
    const chatId = req.body?.chat_id;
    const text = req.body?.text;

    if (!token || !chatId || !text) {
        return res.status(400).send("Error: Missing parameters inside body");
    }

    try {
        const tgUrl = "https://telegram.org" + token + "/sendMessage";

        const tgResponse = await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text })
        });

        const tgBody = await tgResponse.text();
        return res.status(tgResponse.status).send(tgBody);

    } catch (err) {
        return res.status(500).send("Vercel Bridge Error: " + err.message);
    }
});

// Экспортируем приложение для Vercel
module.exports = app;
