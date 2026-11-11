const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show',
        required: true
    },
    seats: {
        type: [String], // Array of strings (e.g., ['A1', 'A2'])
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending' // Jab tak payment confirm na ho, status Pending rahega
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
