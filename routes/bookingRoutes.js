const express = require('express');
const router = express.Router();

const { holdSeatsAndCreateBooking,
    confirmBooking,
    getUserBookings,
    cancelBooking ,
} = require('../controllers/bookingController');

const { protect } = require('../middlewares/authMiddleware');


router.post('/hold', protect, holdSeatsAndCreateBooking);
router.post('/confirm', protect, confirmBooking);
router.get('/my-tickets', protect, getUserBookings);
router.post('/cancel', protect, cancelBooking);

module.exports = router;
