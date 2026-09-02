const net = require('net');

// НАСТРОЙКИ: Укажите точные данные вашего сервера Minecraft
const SERVER_IP = "185.9.145.8"; // IP вашего нового хостинга (например, "95.216.x.x")
const RCON_PORT = 38136; // Порт, который вывела консоль (rcon.port из server.properties)
const RCON_PASSWORD = "zOWZkYmUwM"; // Пароль из rcon.password

const BOT_TOKEN = "7221673120:AAFkNGh15TkomPwDUSSBMbdf9fFzTXVGU2g";
const CHAT_ID = "-1004312204954";

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const sendRconCommand = (host, port, password, command) => {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let authenticated = false;
            let responseData = '';

            client.connect(port, host, () => {
                const passBuf = Buffer.from(password, 'utf8');
                const packet = Buffer.alloc(14 + passBuf.length);
                packet.writeInt32LE(10 + passBuf.length, 0); 
                packet.writeInt32LE(1, 4); 
                packet.writeInt32LE(3, 8); 
                passBuf.copy(packet, 12);
                client.write(packet);
            });

            client.on('data', (data) => {
                if (!authenticated) {
                    const id = data.readInt32LE(4);
                    if (id === -1) {
                        client.destroy();
                        return reject(new Error("RCON Auth Failed: Wrong password"));
                    }
                    authenticated = true;
                    const cmdBuf = Buffer.from(command, 'utf8');
                    const packet = Buffer.alloc(14 + cmdBuf.length);
                    packet.writeInt32LE(10 + cmdBuf.length, 0);
                    packet.writeInt32LE(2, 4); 
                    packet.writeInt32LE(2, 8); 
                    cmdBuf.copy(packet, 12);
                    client.write(packet);
                } else {
                    const payload = data.slice(12, data.length - 2).toString('utf8');
                    responseData += payload;
                    client.destroy();
                    resolve(responseData.trim());
                }
            });

            client.on('error', (err) => { reject(err); });
            client.setTimeout(4000, () => { client.destroy(); reject(new Error("RCON Timeout")); });
        });
    };

    try {
        const banListRaw = await sendRconCommand(SERVER_IP, RCON_PORT, RCON_PASSWORD, "banlist players");

        if (banListRaw && !banListRaw.includes("There are no banned players")) {
            const message = `[Админ-действие] Характер: BAN\n` +
                            `Сервер: OasysPE ii > #1\n` +
                            `Данные из консоли:\n${banListRaw}\n` +
                            `Вы можете купить разбан на сайте - OASYS-PE.COM`;

            const tgUrl = `https://telegram.org{BOT_TOKEN}/sendMessage`;
            
            await fetch(tgUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ chat_id: CHAT_ID, text: message })
            });

            return res.status(200).send("Logs successfully synced with Telegram!");
        }

        return res.status(200).send("No new bans found on the server.");

    } catch (err) {
        return res.status(500).send("RCON Error: " + err.message);
    }
};
