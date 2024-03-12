const express = require('express');
const PORT = process.env.PORT || 3001;
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

const mongoose = require('mongoose');
// Replace 'YOUR_MONGODB_CONNECTION_STRING' with your actual MongoDB connection string
const MONGODB_URI = 'mongodb+srv://root:root@cluster0.7o2pefv.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


// server.js
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { username, password, preference } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      preferences: req.body.preferences
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
    
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If login is successful, send the user's preference data
    res.status(200).json({ message: 'Login successful', preferences: user.preferences });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
