const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    start: { type: Date, required: true },   // Full datetime for calendar
    importance: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' }
});

module.exports = mongoose.model('Calendar', calendarSchema);