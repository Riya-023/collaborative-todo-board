const express = require("express")
const Activity = require("../models/Activity")
const auth = require("../middleware/auth")
const router = express.Router()

// Get last 20 activities
router.get("/", auth, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(20).populate("user", "username email")
    res.json(activities)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
