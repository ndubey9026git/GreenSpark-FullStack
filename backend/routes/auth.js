const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ✅ REGISTER
 * - No longer accepts a role from the user.
 * - All new users are automatically created as "student".
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body; // Role is no longer accepted from req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // ✅ CHANGED: Role is now hardcoded to "student" for all new sign-ups
    const u = new User({ name, email, password: hashed, role: 'student' }); 
    
    await u.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ LOGIN
 * - Checks credentials
 * - Issues JWT token with role
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ GET PROFILE (Protected)
 * - Fetch logged-in user details
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ UPDATE PROFILE (Protected)
 * - Updates name, email, avatar for the logged-in user
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.avatar = avatar; // Allow setting avatar to null

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ LOGOUT
 * - Clears the authentication cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logout successful' });
});

/**
 * ✅ TEACHER ONLY route example
 * - Demonstrates role-based access
 */
router.get("/teacher-data", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied: Teachers only" });
    }
    res.json({ message: "Welcome teacher, here is your secure data 📚" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ STUDENT ONLY route example
 */
router.get("/student-data", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied: Students only" });
    }
    res.json({ message: "Welcome student, keep learning 🌱" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;