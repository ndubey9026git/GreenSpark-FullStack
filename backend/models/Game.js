const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true // Ensure game titles are unique
    },
    description: {
        type: String,
        required: true,
    },
    basePoints: { // Base points awarded for starting the game
        type: Number,
        default: 10,
    },
    // New fields to define the simulation's goals and parameters
    maxPollutionGoal: { // e.g., 20%
        type: Number,
        default: 20,
    },
    targetHealth: { // e.g., 90%
        type: Number,
        default: 90,
    },
    gameDuration: { // e.g., 100 turns/years
        type: Number,
        default: 100,
    },
    gameUrl: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);
