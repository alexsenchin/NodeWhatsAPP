const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    position: String,
    crew: String,
    unit: String,
    sortie: String,
    time: String,
    coords: String,
    target: String,
    eyes: String,
    aircraft: String,
    ammo: String,
    result: String,
    aar: String,
    raw: String,           // оригинальный текст
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flight', flightSchema);
