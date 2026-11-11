
const express = require('express');
const router = express.Router();

const { addShow, getShowsByMovie, getShowSeats, getAllShows} = require('../controllers/showController');
const { protect, admin } = require('../middlewares/authMiddleware');


router.get('/movie-shows', getShowsByMovie); 
router.get('/:id/seats', getShowSeats);      
router.post('/add', protect, admin, addShow);
router.get('/all', protect, admin, getAllShows);

module.exports = router;
