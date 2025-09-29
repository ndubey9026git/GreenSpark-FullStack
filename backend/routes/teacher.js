// backend/routes/teacher.js

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Assignment = require('../models/Assignment');

// Middleware to check for 'teacher' role
const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied: Teachers only" });
  }
  next();
};

/**
 * @route   GET /api/teacher/students
 * @desc    Get all students
 * @access  Private (Teacher only)
 */
router.get("/students", auth, isTeacher, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name email ecoPoints badges"
    );
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ NEW: GET ASSIGNED STUDENTS
 * @route   GET /api/teacher/assigned-students
 * @desc    Get a list of students the teacher has assigned tasks to
 * @access  Private (Teacher only)
 */
router.get('/assigned-students', auth, isTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Find all assignments created by this teacher
        const assignments = await Assignment.find({ assignedBy: teacherId }).populate('student');

        // Create a unique list of students from the assignments
        const assignedStudents = {};
        assignments.forEach(assignment => {
            if (assignment.student) { // Ensure student exists
                assignedStudents[assignment.student._id] = assignment.student;
            }
        });
        
        // Convert the object back to an array
        const studentList = Object.values(assignedStudents);

        res.json(studentList);

    } catch (err) {
        res.status(500).json({ error: 'Server error while fetching assigned students.' });
    }
});


/**
 * @route   POST /api/teacher/assignments
 * @desc    Assign a challenge to a student
 * @access  Private (Teacher only)
 */
router.post('/assignments', auth, isTeacher, async (req, res) => {
    try {
        const { challengeId, studentId, dueDate } = req.body;
        const teacherId = req.user.id;

        const existingAssignment = await Assignment.findOne({
            challenge: challengeId,
            student: studentId,
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'This challenge has already been assigned to this student.' });
        }

        const newAssignment = new Assignment({
            challenge: challengeId,
            student: studentId,
            assignedBy: teacherId,
            dueDate: dueDate,
        });

        await newAssignment.save();
        res.status(201).json({ message: 'Challenge assigned successfully.', assignment: newAssignment });

    } catch (err) {
        res.status(500).json({ error: 'Server error while creating assignment.' });
    }
});

/**
 * @route   GET /api/teacher/students/:studentId/assignments
 * @desc    Get all assignments for a specific student
 * @access  Private (Teacher only)
 */
router.get('/students/:studentId/assignments', auth, isTeacher, async (req, res) => {
    try {
        const { studentId } = req.params;
        const assignments = await Assignment.find({ student: studentId })
            .populate('challenge', 'title points icon')
            .populate('assignedBy', 'name');

        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: 'Server error while fetching assignments.' });
    }
});


module.exports = router;