const express = require('express');
const router = express.Router();
const nodemailer=require('nodemailer')
const Movie = require('../Model/movie');
const Booking=require('../Model/Booking')
const User=require('../Model/Signup')
const jwt = require('jsonwebtoken');
router.use(express.json());
router.use(express.urlencoded({extended:true}))

router.post('/addmovie',  (req, res) => {
  try {
    console.log(req.body)
    let item=req.body;
    const newdata = new Movie(item);
    jwt.verify(req.body.token, 'newKey', (error, decoded) => {
      if (decoded && decoded.email) {
        newdata.save()
        res.json({message:"post added successfully"})
      }
      else{
        res.json({message:"unautherized user"})
      }
    }
    )
  } catch (error) {
    console.error('Post Error:', error);
    res.status(400).send("Post error");
  }
});

router.put('/movies/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    const updatedData = req.body;
    
    const movie = await Movie.findByIdAndUpdate(movieId, updatedData, { new: true });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ message: 'Updated successfully' });
  } catch (error) {
    console.error('Error updating movie by ID:', error);
    res.status(500).json({ error: 'Failed to update movie details.' });
  }
});



router.put('/movies/:id/rate', async (req, res) => {
  try {
    const movieId = req.params.id;
    const newRating = req.body.rating;

    const movie = await Movie.findByIdAndUpdate(movieId, { userRating: newRating }, { new: true });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (movie.ratings) {
      movie.ratings.push(newRating);
    } else {
      movie.ratings = [newRating];
    }

    const updatedMovie = await movie.save();

    res.json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie rating:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Fetch movies route
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies.' });
  }
});

//http://localhost:4000/api/movies/6512b06e4b21b20dafea2bba

router.get('/movies/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    
    // Find the movie by its ID in the database
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Return the movie details
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie by ID:', error);
    res.status(500).json({ error: 'Failed to delete movie.' });
  }
});


const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'rehinasrehinas3@gmail.com',
     pass: 'bmci vbjd ewsw aauf',
  },
});


// // Assuming you have a Movie model with a seatAvailability array

// ... Other imports and setup ...

async function assignSeats(numSeats, alreadyAssignedSeats) {
  console.log('Assigning seats for:', numSeats, 'seats');
  console.log('Already assigned seats:', alreadyAssignedSeats);

  const assignedSeats = [];
  
  // Find the highest seat number from alreadyAssignedSeats
  const highestSeatNumber = alreadyAssignedSeats.reduce((highest, seat) => {
    const seatNumber = parseInt(seat.split(' ')[1]);
    return seatNumber > highest ? seatNumber : highest;
  }, 0);

  // Start assigning seats from the next seat number
  let seatNumber = highestSeatNumber + 1;
  
  while (assignedSeats.length < numSeats) {
    const seat = `Seat ${seatNumber}`;
    if (!alreadyAssignedSeats.includes(seat)) {
      assignedSeats.push(seat);
    }
    seatNumber++;
  }
  console.log('Assigned seats:', assignedSeats);
  return assignedSeats;
}

const mongoose = require('mongoose');
 // Import your Movie model here

router.post('/movies/:id', async (req, res) => {
  const { email, numSeats, date } = req.body;
  const movieId = req.params.id;

  // Validate that movieId is a valid ObjectId
  // if (!mongoose.Types.ObjectId.isValid(movieId)) {
  //   return res.status(400).json({ error: 'Invalid movie ID' });
  // }

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    if (movie.availableSeats === 0) {
      return res.status(400).json({ error: 'House full' });
    }

    if (numSeats <= 0 || numSeats > movie.availableSeats) {
      return res.status(400).json({ error: 'Invalid number of seats requested' });
    }

    // Fetch already assigned seats for the movie and date
    const alreadyAssignedSeats = await Booking.find({
      movie: movieId,
      date,
    }).distinct('seats');

    // Fix: Await the result of assignSeats
    const adminAssignedSeats = await assignSeats(numSeats, alreadyAssignedSeats);

    const booking = new Booking({
      movie: movieId,
      seats: adminAssignedSeats, // Assign the array of seats here
      email,
      date,
    });

    const savedBooking = await booking.save();

    movie.availableSeats -= numSeats;
    await movie.save();

    const mailOptions = {
      from: 'rehinasrehinas3@gmail.com',
      to: email,
      subject: 'Booking Confirmation',
      text: `Thank you for booking ${numSeats} tickets for ${movie.movieName}. Your booking details: Seats: ${adminAssignedSeats.join(', ')} Movie: ${movie.movieName} Date: ${date}`,
    };

    console.log(adminAssignedSeats);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Email could not be sent' });
      } else {
        console.log('Email sent:', info.response);
        res.json({ success: true, message: 'Booking and email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ success: false, message: 'Error fetching movie details' });
  }
});




  



module.exports = router;





//       // Admin must assign the same number of seats as available
     

//       // Admin-assigned seats (you can generate or specify them as needed)
//       const adminAssignedSeats = assignSeats(movie.availableSeats);

//       // Create a new booking with admin-assigned seats
//       const booking = new Booking({
//         movie: movieId,
//         seats: adminAssignedSeats,
//         email,
//       });

//       const savedBooking = await booking.save();

//       // Update available seat count
//       movie.availableSeats -= adminAssignedSeats.length;

//       await movie.save();

//       // Send an email confirmation
//       const mailOptions = {
//         from: 'rehinasrehinas3@example.com',
//         to: email,
//         subject: 'Booking Confirmation',
//         text: `Thank you for booking tickets for ${movie.movieName}. Your booking details: Seats: ${adminAssignedSeats.join(', ')} Movie: ${movie.movieName}`,
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error('Error sending email:', error);
//           res.status(500).json({ success: false, message: 'Email could not be sent' });
//         } else {
//           console.log('Email sent:', info.response);
//           res.json({ success: true, message: 'Booking and email sent successfully' });
//         }
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching movie details:', error);
//     res.status(500).json({ success: false, message: 'Error fetching movie details' });
//   }
// });

// // Function to assign seats in ascending order
// function assignSeats(totalSeats) {
//   const assignedSeats = [];
//   for (let i = 1; i <= totalSeats; i++) {
//     assignedSeats.push(`Seat ${i}`);
//   }
//   return assignedSeats;
// }

module.exports = router;