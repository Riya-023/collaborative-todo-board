"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"
import KanbanBoard from "./KanbanBoard"
import ActivityPanel from "./ActivityPanel"
import TaskModal from "./TaskModal"
import ConflictModal from "./ConflictModal"
import axios from "axios"

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [conflictData, setConflictData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    fetchUsers()
    fetchActivities()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("task-created", (task) => {
        setTasks((prev) => [task, ...prev])
      })

      socket.on("task-updated", (updatedTask) => {
        setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
      })

      socket.on("task-deleted", (taskId) => {
        setTasks((prev) => prev.filter((task) => task._id !== taskId))
      })

      socket.on("new-activity", (activity) => {
        setActivities((prev) => [activity, ...prev.slice(0, 19)])
      })

      socket.on("edit-conflict", (data) => {
        setConflictData(data)
      })

      return () => {
        socket.off("task-created")
        socket.off("task-updated")
        socket.off("task-deleted")
        socket.off("new-activity")
        socket.off("edit-conflict")
      }
    }
  }, [socket])

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/api/tasks")
      setTasks(response.data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/tasks/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await axios.get("/api/activity")
      setActivities(response.data)
    } catch (error) {
      console.error("Error fetching activities:", error)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task) => {
    if (socket) {
      socket.emit("start-editing", { taskId: task._id, user })
    }
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        const response = await axios.put(`/api/tasks/${editingTask._id}`, taskData)
        setTasks((prev) => prev.map((task) => (task._id === editingTask._id ? response.data : task)))
        if (socket) {
          socket.emit("task-updated", response.data)
          socket.emit("stop-editing", editingTask._id)
        }
      } else {
        const response = await axios.post("/api/tasks", taskData)
        setTasks((prev) => [response.data, ...prev])
        if (socket) {
          socket.emit("task-created", response.data)
        }
      }
      setShowTaskModal(false)
      setEditingTask(null)
      fetchActivities()
    } catch (error) {
      console.error("Error saving task:", error)
      alert(error.response?.data?.message || "Error saving task")
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`/api/tasks/${taskId}`)
        setTasks((prev) => prev.filter((task) => task._id !== taskId))
        if (socket) {
          socket.emit("task-deleted", taskId)
        }
        fetchActivities()
      } catch (error) {
        console.error("Error deleting task:", error)
        alert("Error deleting task")
      }
    }
  }

  const handleSmartAssign = async (taskId) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/smart-assign`)
      setTasks((prev) => prev.map((task) => (task._id === taskId ? response.data : task)))
      if (socket) {
        socket.emit("task-updated", response.data)
      }
      fetchActivities()
    } catch (error) {
      console.error("Error smart assigning task:", error)
      alert("Error smart assigning task")
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, { status: newStatus })
      setTasks((prev) => prev.map((task) => (task._id === taskId ? response.data : task)))
      if (socket) {
        socket.emit("task-updated", response.data)
      }
      fetchActivities()
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const handleConflictResolve = (resolution) => {
    setConflictData(null)
    if (resolution === "continue") {
      // Continue with current edit
    } else {
      // Cancel current edit
      setShowTaskModal(false)
      setEditingTask(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Collaborative Todo Board</h1>
        <div className="user-info">
          <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
          <span>Welcome, {user.username}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <KanbanBoard
          tasks={tasks}
          users={users}
          onCreateTask={handleCreateTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onSmartAssign={handleSmartAssign}
          onStatusChange={handleStatusChange}
        />
        <ActivityPanel activities={activities} />
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
            if (editingTask && socket) {
              socket.emit("stop-editing", editingTask._id)
            }
          }}
        />
      )}

      {conflictData && <ConflictModal conflictData={conflictData} onResolve={handleConflictResolve} />}
    </div>
  )
}

export default Dashboard
