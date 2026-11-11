const express = require('express');
const router = express.Router();

const { addTheatre, getTheatreByCity, getAllTheatres } = require('../controllers/theatreController');
const { protect, admin} = require('../middlewares/authMiddleware');

router.get('/', getTheatreByCity);
router.post('/add', protect, admin, addTheatre);
router.get('/all', getAllTheatres);

module.exports = router;