const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chatId: String,
    chatName: String,
    senderName: String,
    senderNumber: String,
    message: String,
    timestamp: Date
});

module.exports = mongoose.model('Message', MessageSchema);
