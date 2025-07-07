const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const socketIo = require("socket.io")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/tasks")
const activityRoutes = require("./routes/activity")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/collaborative-todo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/activity", activityRoutes)

// Socket.IO connection handling
const activeUsers = new Map()
const taskEditSessions = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("user-login", (userData) => {
    activeUsers.set(socket.id, userData)
    socket.broadcast.emit("user-joined", userData)
  })

  socket.on("join-board", (boardId) => {
    socket.join(boardId)
  })

  socket.on("task-updated", (taskData) => {
    socket.broadcast.emit("task-updated", taskData)
  })

  socket.on("task-created", (taskData) => {
    socket.broadcast.emit("task-created", taskData)
  })

  socket.on("task-deleted", (taskId) => {
    socket.broadcast.emit("task-deleted", taskId)
  })

  socket.on("activity-logged", (activity) => {
    socket.broadcast.emit("new-activity", activity)
  })

  socket.on("start-editing", (data) => {
    const { taskId, user } = data
    if (taskEditSessions.has(taskId)) {
      const currentEditor = taskEditSessions.get(taskId)
      socket.emit("edit-conflict", { taskId, currentEditor, newEditor: user })
      io.to(currentEditor.socketId).emit("edit-conflict", { taskId, currentEditor, newEditor: user })
    } else {
      taskEditSessions.set(taskId, { ...user, socketId: socket.id })
      socket.emit("edit-started", { taskId })
    }
  })

  socket.on("stop-editing", (taskId) => {
    taskEditSessions.delete(taskId)
    socket.broadcast.emit("edit-stopped", { taskId })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    const userData = activeUsers.get(socket.id)
    if (userData) {
      socket.broadcast.emit("user-left", userData)
      activeUsers.delete(socket.id)
    }

    // Clean up editing sessions
    for (const [taskId, editor] of taskEditSessions.entries()) {
      if (editor.socketId === socket.id) {
        taskEditSessions.delete(taskId)
        socket.broadcast.emit("edit-stopped", { taskId })
      }
    }
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
