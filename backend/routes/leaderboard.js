const express = require("express");
const User = require("../models/User");
const router = express.Router();

// GET leaderboard (top 10 users by ecoPoints)
router.get("/", async (req, res) => {
  try {
    const leaders = await User.find({})
      .sort({ ecoPoints: -1 }) // sort high to low
      .limit(10) // top 10
      .select("name ecoPoints badges role"); // only return selected fields

    res.json(leaders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
