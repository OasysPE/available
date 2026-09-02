const { Rcon } = require('rcon-client');

// НАСТРОЙКИ: Укажите точные данные вашего сервера Minecraft
const SERVER_IP = "185.9.145.8"; // (Например: "95.216.x.x" — без порта!)
const RCON_PORT = 38136; // Порт, который открыло ваше ядро
const RCON_PASSWORD = "zOWZkYmUwM"; // Пароль из rcon.password

const BOT_TOKEN = "7221673120:AAFkNGh15TkomPwDUSSBMbdf9fFzTXVGU2g";
const CHAT_ID = "-1004312204954";

module.exports = async (req, res) => {
    try {
        // Подключаемся к консоли вашего сервера из Европы в обход любых блокировок хостинга
        const rcon = await Rcon.connect({
            host: SERVER_IP,
            port: RCON_PORT,
            password: RCON_PASSWORD
        });

        // Запрашиваем список забаненных игроков напрямую из памяти ядра
        const banListRaw = await rcon.send("banlist players");
        await rcon.end();

        // Если на сервере есть забаненные, отправляем лог в Telegram
        if (banListRaw && !banListRaw.includes("There are no banned players")) {
            const message = `[Админ-действие] Характер: BAN\n` +
                            `Сервер: OasysPE ii > #1\n` +
                            `Данные из консоли:\n${banListRaw}\n` +
                            `Вы можете купить разбан на сайте - OASYS-PE.COM`;

            const tgUrl = `https://telegram.org{BOT_TOKEN}/sendMessage`;
            
            await fetch(tgUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: message })
            });

            return res.status(200).send("Logs successfully synced with Telegram!");
        }

        return res.status(200).send("No new bans found.");

    } catch (err) {
        return res.status(500).send("RCON Gateway Error: " + err.message);
    }
};
