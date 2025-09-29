// backend/models/GameProgress.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameProgressSchema = new Schema({
    game: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: true,
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// This ensures each student can only have one progress record per game
GameProgressSchema.index({ game: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('GameProgress', GameProgressSchema);