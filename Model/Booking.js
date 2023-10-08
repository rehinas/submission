const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  seats: {
    type: [String], 
    required: true,
  },
 
  email: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // Other fields as needed for your booking information
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;


