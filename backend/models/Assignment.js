// backend/models/Assignment.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['assigned', 'completed', 'verified'],
    default: 'assigned',
  },
  dueDate: {
    type: Date,
  },
}, { timestamps: true });

// This ensures a student cannot be assigned the same challenge twice.
AssignmentSchema.index({ challenge: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);