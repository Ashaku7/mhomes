// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middlewares/auth');

// PUBLIC — anyone can check availability
router.get('/rooms/available', controller.getAvailableRooms);

// PROTECTED — get bookings for logged-in user (must come before :id routes)
router.get('/bookings/my',
    protect,
    controller.getMyBookings
);

// PROTECTED — must be logged in to create a booking
// reception and admin can create offline bookings
// guests can create online bookings
router.post('/bookings',
    protect,
    restrictTo('guest', 'admin', 'reception'),
    controller.createBooking
);

// PROTECTED — admin and reception can confirm payment
router.post('/bookings/:id/confirm-payment',
    protect,
    restrictTo('admin', 'reception'),
    controller.confirmPayment
);

module.exports = router;