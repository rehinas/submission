const express = require('express');
const router = express.Router();
const Sign = require('../Model/Signup'); 
const jwt = require('jsonwebtoken');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); 
  }

  jwt.verify(token, 'newKey', (err, user) => { 
    if (err) {
      return res.sendStatus(403); 
    }
    req.user = user;
    next();
  });
}
router.get('/user', authenticateToken, async (req, res) => {
  try {
    // You can access the authenticated user's data from req.user
    const userId = req.user.id;

    const user = await Sign.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Sign.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (user.password === password) {
      const userRole = user.userRole;
      jwt.sign({ email: email, id: user._id }, "newKey", { expiresIn: '1d' }, (error, token) => {
        if (error) {
          res.status(500).json({ message: 'Token not generated' });
        } else {
          res.status(200).json({ message: 'Login successful', token: token, data: user, userRole: userRole });
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});



router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Sign.findOne({ email });
    if (user) {
      res.json({ emailExists: true });
    } else {
      res.json({ emailExists: false });
    }
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ message: 'Email check failed' });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body; 

    let userRole = 'user';

    if (email === 'admin@gmail.com') {
      userRole = 'admin';
    }

    const userExists = await Sign.findOne({ email }); // Change 'emails' to 'email' here

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number (10 digits required)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new Sign({ name, email, phoneNumber, password, userRole }); // Change 'emails' to 'email' here
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validatePhoneNumber(phoneNumber) {
  return /^\d{10}$/.test(phoneNumber);
}
router.get('/login', async (req, res) => {
  try {
    const sign = await Sign.find();
    res.status(200).json(sign);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies.' });
  }
});

router.get('/login/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user by ID in your database
    const user = await Sign.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user details
    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/login', async (req, res) => {
  try {
    const sign = await Sign.find();
    res.status(200).json(sign);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies.' });
  }
});

module.exports = router;
