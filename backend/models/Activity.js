const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ["created", "updated", "deleted", "assigned", "moved", "smart-assigned"],
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  taskTitle: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Activity", activitySchema)
