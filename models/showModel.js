const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie',
        required: [true, "Movie ID zaroori hai"]
    },
    theatre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre', 
        required: [true, "Theatre ID zaroori hai"]
    },
    date: {
        type: String, 
        required: [true, "Show ki date zaroori hai"]
    },
    time: {
        type: String, 
        required: [true, "Show ka time zaroori hai"]
    },
    ticketPrice: {
        type: Number,
        required: [true, "Ticket ka price zaroori hai"]
    },
    
    seats: [
        {
            seatNumber: { type: String, required: true }, 
            status: { 
                type: String, 
                enum: ['Available', 'Reserved', 'Booked'], 
                default: 'Available' 
            },
            reservedUntil: { type: Date, default: null } 
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Show', showSchema);
