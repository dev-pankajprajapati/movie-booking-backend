const Movie = require('../models/movieModel');

const addMovie = async (req, res) => {
    try{
        const {title, description, duration, language, genre, posterUrl} = req.body;
        if(!title || !description || !duration || !language || !genre || !posterUrl){
            return res.status(400).json({message: "Each Field is required "});
        }
        const newMovie = await Movie.create({
            title,
            description,
            duration,
            language,
            genre,
            posterUrl

        });
        return res.status(201).json({
            message: "Movie successfully added ! ",
            data: newMovie
        });
    } catch (error){
        return res.status(500).json({message: "Error occur ! Movie not Added", error: error.message});

    }
};
const getAllMovies = async (req, res) => {
    try{
        const movies = await Movie.find();
        return res.status(200).json(movies);

    } catch (error) {
        return res.status(500).json({ message: "Movies not loaded successfully ", error: error.message});
    }
}

module.exports = {addMovie, getAllMovies}