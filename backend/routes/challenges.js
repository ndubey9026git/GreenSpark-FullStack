// backend/routes/challenges.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Challenge = require('../models/Challenge');

router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find({});
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/complete', auth, async (req, res) => {
  try {
    // --- START DEBUG LOGGING ---
    console.log("--- Starting Challenge Completion ---");
    const { challengeId } = req.body;
    console.log("1. Received Challenge ID:", challengeId);
    
    const ch = await Challenge.findById(challengeId);
    if (!ch) {
      console.log("Error: Challenge not found in database.");
      return res.status(400).json({ message: 'Invalid challenge' });
    }
    console.log("2. Found Challenge in DB:", ch);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("Error: User not found in database.");
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("3. Found User in DB (Before Update):", {
        ecoPoints: user.ecoPoints,
        badges: user.badges,
        completed: user.completed
    });

    if (!user.completed) user.completed = [];
    if (!user.badges) user.badges = [];
    
    const challengeAlreadyCompleted = user.completed.some(c => c.toString() === ch._id.toString());
    if(challengeAlreadyCompleted){
      console.log("Result: Challenge was already completed by this user.");
      return res.status(400).json({message: 'Challenge already completed'});
    }
    
    user.ecoPoints += ch.points;
    user.completed.push(ch._id);

    const unlocked = [];
    const pts = user.ecoPoints;
    if (pts >= 50 && !user.badges.includes('Eco Starter')) { user.badges.push('Eco Starter'); unlocked.push('Eco Starter'); }
    if (pts >= 100 && !user.badges.includes('Eco Hero')) { user.badges.push('Eco Hero'); unlocked.push('Eco Hero'); }
    if (pts >= 200 && !user.badges.includes('Eco Champion')) { user.badges.push('Eco Champion'); unlocked.push('Eco Champion'); }

    await user.save();
    console.log("4. User Data Saved (After Update):", {
        ecoPoints: user.ecoPoints,
        badges: user.badges,
        completed: user.completed
    });
    console.log("--- Challenge Completion Successful ---");
    // --- END DEBUG LOGGING ---
    
    res.json({ ecoPoints: user.ecoPoints, badges: user.badges, unlocked });
  } catch (err) {
    console.error("!!! CRITICAL ERROR IN /complete ROUTE:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;