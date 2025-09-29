// backend/models/Lesson.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Waste Management', 'Energy Conservation', 'Water Conservation', 'Biodiversity'],
  },
  content: {
    type: String, // Can store Markdown text
    required: true,
  },
  // We can add a reference to a Quiz later
  // quiz: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Quiz'
  // }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);