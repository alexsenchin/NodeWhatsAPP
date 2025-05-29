const { Client, LocalAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const Flight = require('./models/Flight');

const LOG_PATH = './logs/chat-log.txt';
const MONGO_URI = 'mongodb://127.0.0.1:27017/whatsapp_logger';
const TARGET_GROUP_ID = process.env.TARGET_GROUP_ID;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('📦 MongoDB подключена');
}).catch(err => {
    console.error('❌ MongoDB ошибка:', err);
});

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('✅ WhatsApp готов'));

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup || chat.id._serialized !== TARGET_GROUP_ID) return;

        const text = msg.body;
        const timestamp = new Date();

        const data = {
            position: getField(text, /ПОЗИЦІЯ:\s*(.+)/i),
            crew: getField(text, /ЕКІПАЖ:\s*(.+)/i),
            unit: getField(text, /ПІДРОЗДІЛ:\s*(.+)/i),
            sortie: getField(text, /ЗЛІТ:\s*(.+)/i),
            time: getField(text, /ЧАС:\s*(.+)/i),
            coords: getField(text, /MGRS:\s*(.+)/i) || getField(text, /Орієнтири\s*:\s*(.+)/i),
            target: getField(text, /ЦІЛЬ:\s*(.+)/i),
            eyes: getField(text, /ОЧ[ІІіі]:\s*(.+)/i),
            aircraft: getField(text, /БОРТ:\s*(.+)/i),
            ammo: getField(text, /БК:\s*(.+)/i),
            result: getField(text, /РЕЗУЛЬТАТ:\s*(.+)/i),
            aar: getField(text, /AAR:\s*(.+)/i),
            raw: text,
            timestamp
        };

        const isFlight = data.position && data.crew && data.unit && data.target;
        if (isFlight) {
            await Flight.create(data);
            console.log('✈️ Вылет сохранён:', data);
        }

        const logLine = `[${timestamp.toISOString()}] ${msg.body}\n`;
        fs.appendFileSync(LOG_PATH, logLine);

    } catch (err) {
        console.error('❌ Ошибка при обработке сообщения:', err);
    }
});

client.initialize();

function getField(text, regex) {
    const match = text.match(regex);
    return match ? match[1].trim() : '';
}
