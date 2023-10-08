const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
 
  
  movieName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  category: {
    type: [String],
    required: true,
  },
  languages: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  releaseDate: Date,
  duration: Number,

  ticketRates: {
    type: Number,
    required: true,
  }
  ,
  seat: {
    type: Number,
    required: true,
  }
  ,
  screen: {
    type:[String],
    required: true,
  },
 cast:{
  type:String,
 },
 
 userRating: Number, // User's rating for the movie
  ratings: [Number],

  availableSeats: {
    type: Number,
    // Set a default value, e.g., 0 seats available initially
  },
numSeats:Number,
date: {
  type: Date,
  default: Date.now,
},
time:{
  type:[String]
}

});


const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;


