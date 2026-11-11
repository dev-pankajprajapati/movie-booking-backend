const Theatre = require('../models/theatreModel');

const addTheatre = async (req, res) => {
    try{
        const {name, location, city, totalScreens} = req.body;
        if(!name || !location || !city){
            return res.status(400).json({message: "Each field is requird"});
        }
        const newTheatre = Theatre.create({
            name,
            location,
            city,
            totalScreens: totalScreens || 1
        });
        res.status(201).json({
            message: "Theatre added successfully",
            data: newTheatre
        });
    } catch (error) {
        return res.status(500).json({ message: "Error Ocuur ! Theatre not added", error: error.message});
    }
};

const getTheatreByCity = async (req, res) => {
    try{
        const { city } = req.query; // url query se city ka name niklna 
        if(!city){
            return res.status(400).json({message: "Please enter the city"});
        }
        const theatres = await Theatre.find({city: city.lowercase()});
        return res.status(200).json(theatres);

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong ", error: error.message});
    }
};

const getAllTheatres = async (req, res) => {
    try{
        const theatres = await Theatre.find();
        return res.status(200).json(theatres);
    } catch (error){
        return res.status(500).json({message: "Error in loading theatres", error: error.message});
    }
};

module.exports = { addTheatre, getTheatreByCity, getAllTheatres };