// backend/routes/assignments.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Assignment = require('../models/Assignment');

/**
 * @route   GET /api/assignments/my-assignments
 * @desc    Get all assignments for the logged-in student
 * @access  Private
 */
router.get('/my-assignments', auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        
        const assignments = await Assignment.find({ student: studentId, status: 'assigned' })
            .populate('challenge', 'title description points icon') // Get full challenge details
            .populate('assignedBy', 'name'); // Get the name of the teacher who assigned it

        res.json(assignments);
    } catch (err) {
        console.error("Server error fetching assignments:", err);
        res.status(500).json({ error: 'Server error while fetching assignments.' });
    }
});

module.exports = router;