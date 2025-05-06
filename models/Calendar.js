const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    start: { type: Date, required: true },
    importance: { type: String, enum: ['lightgreen', 'yellow', 'lightcoral'], default: 'lightgreen' }
});

module.exports = mongoose.model('Calendar', calendarSchema);