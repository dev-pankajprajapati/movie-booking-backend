const Show = require('../models/showModel');


const addShow = async (req, res) => {
    try {
        const { movie, theatre, date, time, ticketPrice } = req.body;

        if (!movie || !theatre || !date || !time || !ticketPrice) {
            return res.status(400).json({ message: "Kripya saari fields fill karein." });
        }
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const generatedSeats = [];
        for (let i = 0; i < rows.length; i++) {
            for (let seatNum = 1; seatNum <= 10; seatNum++) {
                generatedSeats.push({
                    seatNumber: `${rows[i]}${seatNum}`, // e.g., A1, A2, B5
                    status: 'Available',
                    reservedUntil: null
                });
            }
        }
        const newShow = await Show.create({
            movie,
            theatre,
            date,
            time,
            ticketPrice,
            seats: generatedSeats
        });

        return res.status(201).json({
            message: "Show aur Seats Matrix successfully ready ho gaye hain! 🎟️🎬",
            data: newShow
        });

    } catch (error) {
        return res.status(500).json({ message: "Show create karne mein koi error aayi", error: error.message });
    }
};

const getShowsByMovie = async (req, res) => {
    try {
        const { movieId, date } = req.query;

        if (!movieId || !date) {
            return res.status(400).json({ message: "Movie ID aur Date dono zaroori hain." });
        }

        const shows = await Show.find({ movie: movieId, date: date })
            .populate('movie')    
            .populate('theatre')  
            .select('-seats');    

        res.status(200).json(shows);

    } catch (error) {
        return res.status(500).json({ message: "Shows load nahi ho paye", error: error.message });
    }
};

const getShowSeats = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);
        
        if (!show) {
            return res.status(404).json({ message: "Show nahi mila!" });
        }

        res.status(200).json({
            ticketPrice: show.ticketPrice,
            seats: show.seats
        });
    } catch (error) {
        return res.status(500).json({ message: "Seats fetch karne mein koi error aayi", error: error.message });
    }
};

const getAllShows = async (req, res) => {
    try{
        const shows = await Show.find();
        return res.status(200).json(shows);
    } catch (error){
        return res.status(500).json({message: "Shows not loaded ", error: error.message});
    }
};

module.exports = { addShow, getShowsByMovie, getShowSeats, getAllShows};
