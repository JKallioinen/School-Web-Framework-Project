const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: false },
    importance: { type: String, enum: ['lightgreen', 'yellow', 'lightcoral'], default: 'lightgreen' }
});

module.exports = mongoose.model('Calendar', calendarSchema);