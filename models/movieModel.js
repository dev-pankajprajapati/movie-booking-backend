const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    duration: {
        type: Number,
        required: [true, "Duration is required"]
    },
    language: {
        type: String,
        required: [true, "Language is required"]
    },
    genre: {
        type: [String],   
        required: [true, "Genre is required"]
    },
    posterUrl: {
        type: String,
        required: [true, " Movie poster is required"]
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Movie', movieSchema);

