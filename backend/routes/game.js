// backend/routes/game.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const Game = require('../models/Game');
const GameProgress = require('../models/GameProgress');
const User = require('../models/User');

// @route   POST /api/games/
// @desc    Create a new game
// @access  Admin and Teacher
router.post('/', auth, async (req, res) => {
    if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Authorization denied' });
    }
    const { title, description, points, gameUrl } = req.body;
    try {
        const newGame = new Game({
            title,
            description,
            points,
            gameUrl,
            uploadedBy: req.user.id
        });
        await newGame.save();
        res.status(201).json(newGame);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while creating game.' });
    }
});

// @route   GET /api/games/
// @desc    Get all games
// @access  Public
router.get('/', async (req, res) => {
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        res.json(games);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while fetching games.' });
    }
});

// @route   GET /api/games/:id
// @desc    Get a single game by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }
        res.json(game);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while fetching game.' });
    }
});


// @route   POST /api/games/:id/submit-score
// @desc    Submit a student's score for a game
// @access  Student (and others for testing)
router.post('/:id/submit-score', auth, async (req, res) => {
    const { score } = req.body;
    const studentId = req.user.id;
    const gameId = req.params.id;

    if (!score && score !== 0) {
        return res.status(400).json({ msg: 'Score is required' });
    }

    try {
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }
        
        let gameProgress = await GameProgress.findOneAndUpdate(
            { game: gameId, student: studentId },
            { $max: { score: score }, completed: true },
            { new: true, upsert: true }
        );

        const user = await User.findById(studentId);
        const pointsAwarded = Math.max(0, score - (gameProgress.score || 0));
        user.ecoPoints += pointsAwarded;
        await user.save();
        
        res.json({
            msg: `Score submitted successfully! You earned ${pointsAwarded} Eco Points.`,
            newTotalPoints: user.ecoPoints
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while submitting score.' });
    }
});

module.exports = router;