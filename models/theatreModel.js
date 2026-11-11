const mongoose = require('mongoose');

const theatreSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Theatre name is required"],
        trim: true
    },
    location: {
        type: String,
        required: [true, "Theatre Location is required"]
    },
    city: {
        type: String,
        required: [true, "Theatre city is required"],
        lowercase: true 
    },
    totalScreens: {
        type: Number,
        default: 1
    }
},  {
    timestamps: true
});

module.exports = mongoose.model('Theatre', theatreSchema);