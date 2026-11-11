const express = require('express');
const router = express.Router();

const { getAllMovies, addMovie } = require('../controllers/movieController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/all', getAllMovies);
router.post('/add', protect, admin, addMovie);

module.exports = router;