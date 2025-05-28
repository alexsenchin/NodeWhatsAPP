const express = require('express');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const app = express();
const PORT = 3000;

// Подключение к MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/whatsapp_logger', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Настройки EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Маршрут: отображение всех сообщений
app.get('/', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(100);
        res.render('index', { messages });
    } catch (err) {
        res.status(500).send('Ошибка при загрузке сообщений');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🌐 Веб-интерфейс доступен на http://localhost:${PORT}`);
});
