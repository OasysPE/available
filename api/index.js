module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const token = req.body?.token || req.query?.token;
    const chatId = req.body?.chat_id || req.query?.chat_id;
    const text = req.body?.text || req.query?.text;

    if (!token || !chatId || !text) {
        return res.status(400).send("Error: Missing parameters (token, chat_id, or text)");
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
};
