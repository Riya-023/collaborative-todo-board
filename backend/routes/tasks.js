const express = require("express")
const Task = require("../models/Task")
const User = require("../models/User")
const Activity = require("../models/Activity")
const auth = require("../middleware/auth")
const router = express.Router()

// Get all tasks
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority } = req.body

    // Check if title is unique and not a column name
    const columnNames = ["Todo", "In Progress", "Done"]
    if (columnNames.includes(title)) {
      return res.status(400).json({ message: "Task title cannot match column names" })
    }

    const existingTask = await Task.findOne({ title })
    if (existingTask) {
      return res.status(400).json({ message: "Task title must be unique" })
    }

    const task = new Task({
      title,
      description,
      priority,
      createdBy: req.userId,
    })

    await task.save()
    await task.populate("createdBy", "username email")

    // Log activity
    const user = await User.findById(req.userId)
    const activity = new Activity({
      action: "created",
      taskId: task._id,
      taskTitle: task.title,
      user: req.userId,
      username: user.username,
      details: `Created task "${task.title}"`,
    })
    await activity.save()

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update task
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check title uniqueness if title is being changed
    if (title && title !== task.title) {
      const columnNames = ["Todo", "In Progress", "Done"]
      if (columnNames.includes(title)) {
        return res.status(400).json({ message: "Task title cannot match column names" })
      }

      const existingTask = await Task.findOne({ title })
      if (existingTask) {
        return res.status(400).json({ message: "Task title must be unique" })
      }
    }

    const oldStatus = task.status
    const oldAssignedTo = task.assignedTo

    // Update task
    if (title) task.title = title
    if (description !== undefined) task.description = description
    if (status) task.status = status
    if (priority) task.priority = priority
    if (assignedTo !== undefined) task.assignedTo = assignedTo

    task.lastEditedBy = req.userId
    task.lastEditedAt = new Date()

    await task.save()
    await task.populate(["assignedTo", "createdBy"], "username email")

    // Log activity
    const user = await User.findById(req.userId)
    let activityDetails = `Updated task "${task.title}"`
    let actionType = "updated"

    if (status && status !== oldStatus) {
      activityDetails = `Moved task "${task.title}" from ${oldStatus} to ${status}`
      actionType = "moved"
    } else if (assignedTo !== oldAssignedTo) {
      const assignedUser = assignedTo ? await User.findById(assignedTo) : null
      activityDetails = assignedUser
        ? `Assigned task "${task.title}" to ${assignedUser.username}`
        : `Unassigned task "${task.title}"`
      actionType = "assigned"
    }

    const activity = new Activity({
      action: actionType,
      taskId: task._id,
      taskTitle: task.title,
      user: req.userId,
      username: user.username,
      details: activityDetails,
    })
    await activity.save()

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    await Task.findByIdAndDelete(req.params.id)

    // Log activity
    const user = await User.findById(req.userId)
    const activity = new Activity({
      action: "deleted",
      taskId: req.params.id,
      taskTitle: task.title,
      user: req.userId,
      username: user.username,
      details: `Deleted task "${task.title}"`,
    })
    await activity.save()

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Smart assign task
router.post("/:id/smart-assign", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Get all users and their active task counts
    const users = await User.find()
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const activeTaskCount = await Task.countDocuments({
          assignedTo: user._id,
          status: { $in: ["Todo", "In Progress"] },
        })
        return { user, activeTaskCount }
      }),
    )

    // Find user with fewest active tasks
    const userWithFewestTasks = userTaskCounts.reduce((min, current) =>
      current.activeTaskCount < min.activeTaskCount ? current : min,
    )

    // Assign task
    task.assignedTo = userWithFewestTasks.user._id
    task.lastEditedBy = req.userId
    task.lastEditedAt = new Date()
    await task.save()
    await task.populate(["assignedTo", "createdBy"], "username email")

    // Log activity
    const user = await User.findById(req.userId)
    const activity = new Activity({
      action: "smart-assigned",
      taskId: task._id,
      taskTitle: task.title,
      user: req.userId,
      username: user.username,
      details: `Smart assigned task "${task.title}" to ${userWithFewestTasks.user.username}`,
    })
    await activity.save()

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find().select("username email")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
