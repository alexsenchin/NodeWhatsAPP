const express = require('express');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const Flight = require('./models/Flight');
const app = express();
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/whatsapp_logger', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(100);
        res.render('index', { messages });
    } catch (err) {
        res.status(500).send('Ошибка загрузки сообщений');
    }
});

app.get('/flights', async (req, res) => {
    try {
        const flights = await Flight.find().sort({ timestamp: -1 }).limit(100);
        res.render('flights', { flights });
    } catch (err) {
        res.status(500).send('Ошибка загрузки вылетов');
    }
});

app.listen(PORT, () => {
    console.log(`🌐 Сервер запущен: http://localhost:${PORT}`);
});
