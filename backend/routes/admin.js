const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const bcrypt = require("bcryptjs"); // Added import for password hashing

// Middleware to check for 'admin' role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// =======================
//  USER MANAGEMENT
// =======================
/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admins only)
 * @access  Private
 */
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ NEW: CREATE A NEW USER (Admin only)
 * @route   POST /api/admin/users
 * @desc    Admin creates a new user (student or teacher)
 * @access  Private (Admin only)
 */
router.post('/users', auth, isAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide name, email, password, and role.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role, // Admin can set the role directly
        });

        await newUser.save();
        const userResponse = newUser.toObject();
        delete userResponse.password; // Ensure password is not sent back

        res.status(201).json({ message: 'User created successfully.', user: userResponse });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while creating user.' });
    }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (Admins only)
 * @access  Private
 */
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
//  CHALLENGE MANAGEMENT
// =======================
/**
 * @route   POST /api/admin/challenges
 * @desc    Create a new challenge (Admins only)
 * @access  Private
 */
router.post('/challenges', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, points, icon } = req.body;
    const newChallenge = new Challenge({ title, description, points, icon });
    await newChallenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/admin/challenges/:id
 * @desc    Update a challenge (Admins only)
 * @access  Private
 */
router.put('/challenges/:id', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, points, icon } = req.body;
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { title, description, points, icon },
      { new: true, runValidators: true }
    );
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/admin/challenges/:id
 * @desc    Delete a challenge (Admins only)
 * @access  Private
 */
router.delete('/challenges/:id', auth, isAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json({ message: 'Challenge deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;