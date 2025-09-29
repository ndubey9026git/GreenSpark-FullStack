const mongoose = require('mongoose');
const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  points: { type: Number, required: true },
  icon: { type: String, required: true, default: '🌍' }
}, { timestamps: true });
module.exports = mongoose.model('Challenge', ChallengeSchema);