// backend/models/Quiz.js

const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    pointsAwarded: {
        type: Number,
        default: 10
    },
    questions: [
        {
            question: {
                type: String,
                required: true
            },
            options: {
                type: [String],
                required: true
            },
            correctAnswer: {
                type: String,
                required: true // ✅ FIX: Correct answer is required to save a quiz
            }
        }
    ]
});

module.exports = mongoose.model('Quiz', QuizSchema);