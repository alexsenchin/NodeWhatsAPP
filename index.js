const { Client, LocalAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

// === Константы ===
const LOG_PATH = './logs/chat-log.txt';
const MONGO_URI = 'mongodb://127.0.0.1:27017/whatsapp_logger';
const TARGET_GROUP_ID = process.env.TARGET_GROUP_ID;

// === Подключение к MongoDB ===
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('📦 Подключено к MongoDB');
}).catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err);
});

// === Модель сообщения ===
const Message = mongoose.model('Message', new mongoose.Schema({
    chatId: String,
    chatName: String,
    senderName: String,
    senderNumber: String,
    message: String,
    timestamp: Date
}));

// === Инициализация клиента WhatsApp ===
const client = new Client({
    authStrategy: new LocalAuth()
});

// === Сканирование QR ===
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// === Готовность клиента ===
client.on('ready', () => {
    console.log('✅ WhatsApp клиент готов к работе!');
});

// === Обработка входящих сообщений ===
client.on('message', async msg => {
    try {
        const chat = await msg.getChat();

        // Фильтр: только нужная группа
        if (!chat.isGroup || chat.id._serialized !== TARGET_GROUP_ID) return;

        const contact = await msg.getContact();
        const timestamp = new Date();
        const senderName = contact.pushname || contact.name || contact.number;
        const senderNumber = contact.number;
        const chatName = chat.name || chat.id.user;

        // Запись в текстовый файл
        const logLine = `[${timestamp.toISOString()}] [${chatName}] ${senderName}: ${msg.body}\n`;
        fs.appendFileSync(LOG_PATH, logLine);

        // Запись в MongoDB
        await Message.create({
            chatId: chat.id._serialized,
            chatName,
            senderName,
            senderNumber,
            message: msg.body,
            timestamp
        });

        console.log(`📥 Записано: ${logLine.trim()}`);
    } catch (err) {
        console.error('❌ Ошибка при логировании сообщения:', err);
    }
});

// === Запуск клиента ===
client.initialize();
