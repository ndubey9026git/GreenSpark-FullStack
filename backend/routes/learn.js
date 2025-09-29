// backend/routes/learn.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

/**
 * @route   GET /api/learn/lessons
 * @desc    Get a list of all lessons
 * @access  Public
 */
router.get('/lessons', async (req, res) => {
    try {
        const lessons = await Lesson.find({}).select('title category');
        res.json(lessons);
    } catch (err) {
        console.error("Error fetching lessons:", err);
        res.status(500).json({ error: 'Server error while fetching lessons.' });
    }
});

/**
 * @route   GET /api/learn/lessons/:id
 * @desc    Get a single lesson by its ID, including its quiz questions
 * @access  Private
 */
router.get('/lessons/:id', auth, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found.' });
        }
        
        const quiz = await Quiz.findOne({ lesson: lesson._id })
            .select('-questions.correctAnswer'); 
        
        res.json({ lesson, quiz });
    } catch (err) {
        console.error("Error fetching single lesson:", err);
        res.status(500).json({ error: 'Server error while fetching the lesson.' });
    }
});

/**
 * @route   POST /api/learn/quizzes/:quizId/submit
 * @desc    Submit answers for a quiz and get a score
 * @access  Private
 */
router.post('/quizzes/:quizId/submit', auth, async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;
        const userId = req.user.id;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        
        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] && answers[index] === question.correctAnswer) {
                score++;
            }
        });
        
        const totalQuestions = quiz.questions.length;
        const percentage = (score / totalQuestions) * 100;
        
        if (percentage >= 80) {
            const user = await User.findById(userId);
            user.ecoPoints += quiz.pointsAwarded;
            await user.save();
            return res.json({
                message: `Congratulations! You scored ${score}/${totalQuestions}.`,
                pointsAwarded: quiz.pointsAwarded
            });
        } else {
            return res.json({
                message: `You scored ${score}/${totalQuestions}. Try again to earn the points!`,
                pointsAwarded: 0
            });
        }
    } catch (err) {
        console.error("Error submitting quiz:", err);
        res.status(500).json({ error: 'Server error while submitting the quiz.' });
    }
});

/**
 * @route   GET /api/learn/admin/lessons
 * @desc    Get all lessons for admin/teacher management
 * @access  Admin and Teacher
 */
router.get('/admin/lessons', auth, async (req, res) => {
    if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Authorization denied' });
    }
    try {
        const lessons = await Lesson.find({});
        const lessonsWithQuizzes = await Promise.all(lessons.map(async (lesson) => {
            const quiz = await Quiz.findOne({ lesson: lesson._id });
            return { ...lesson.toObject(), quiz };
        }));
        res.json(lessonsWithQuizzes);
    } catch (err) {
        console.error("Error fetching admin lessons:", err);
        res.status(500).json({ error: 'Server error while fetching lessons for admin.' });
    }
});

/**
 * @route   POST /api/learn/admin/lessons
 * @desc    Create a new lesson and its associated quiz
 * @access  Admin and Teacher
 */
router.post('/admin/lessons', auth, async (req, res) => {
    if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Authorization denied' });
    }
    const { title, category, content, questions } = req.body;

    // ✅ FIX: Check if required fields are present
    if (!title || !category || !content) {
        return res.status(400).json({ msg: 'Please enter all fields for the lesson.' });
    }
    
    // ✅ NEW DEBUGGING STEP: Log the received data to the backend console
    console.log("Received data:", req.body);

    try {
        const newLesson = new Lesson({ title, category, content });
        await newLesson.save();

        // ✅ FIX: Only try to save a quiz if questions are provided and valid
        if (questions && questions.length > 0 && questions.every(q => q.question && q.options.length > 0)) {
            const newQuiz = new Quiz({
                lesson: newLesson._id,
                pointsAwarded: 10,
                questions: questions
            });
            await newQuiz.save();
        }

        res.status(201).json({ msg: "Lesson and quiz created successfully!" });
    } catch (err) {
        console.error("Error creating new lesson:", err);
        res.status(500).json({ error: 'Server error while creating lesson.' });
    }
});

/**
 * @route   PUT /api/learn/admin/lessons/:id
 * @desc    Update an existing lesson and its quiz
 * @access  Admin and Teacher
 */
router.put('/admin/lessons/:id', auth, async (req, res) => {
    if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Authorization denied' });
    }
    const { title, category, content, questions } = req.body;

    try {
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            { title, category, content },
            { new: true }
        );

        if (!lesson) {
            return res.status(404).json({ msg: 'Lesson not found' });
        }

        const quiz = await Quiz.findOneAndUpdate(
            { lesson: req.params.id },
            { questions },
            { new: true }
        );

        res.json({ lesson, quiz });
    } catch (err) {
        console.error("Error updating lesson:", err);
        res.status(500).json({ error: 'Server error while updating lesson.' });
    }
});

/**
 * @route   DELETE /api/learn/admin/lessons/:id
 * @desc    Delete a lesson and its quiz
 * @access  Admin and Teacher
 */
router.delete('/admin/lessons/:id', auth, async (req, res) => {
    if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    try {
        await Lesson.findByIdAndDelete(req.params.id);
        await Quiz.findOneAndDelete({ lesson: req.params.id });

        res.json({ msg: 'Lesson and associated quiz deleted' });
    } catch (err) {
        console.error("Error deleting lesson:", err);
        res.status(500).json({ error: 'Server error while deleting lesson.' });
    }
});

module.exports = router;