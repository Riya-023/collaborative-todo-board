"use client"

import { useState } from "react"
import TaskCard from "./TaskCard"

const KanbanBoard = ({ tasks, users, onCreateTask, onEditTask, onDeleteTask, onSmartAssign, onStatusChange }) => {
  const [draggedTask, setDraggedTask] = useState(null)

  const columns = [
    { id: "Todo", title: "Todo", color: "#007bff" },
    { id: "In Progress", title: "In Progress", color: "#ffc107" },
    { id: "Done", title: "Done", color: "#28a745" },
  ]

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      onStatusChange(draggedTask._id, newStatus)
    }
    setDraggedTask(null)
  }

  return (
    <div className="kanban-board">
      <div className="board-header">
        <h2>Task Board</h2>
        <button className="add-task-btn" onClick={onCreateTask}>
          + Add Task
        </button>
      </div>

      <div className="kanban-columns">
        {columns.map((column) => (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header">
              <h3 className="column-title" style={{ color: column.color }}>
                {column.title}
              </h3>
              <span className="task-count">{getTasksByStatus(column.id).length}</span>
            </div>

            <div className="tasks-container">
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  users={users}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onSmartAssign={onSmartAssign}
                  onDragStart={handleDragStart}
                  isDragging={draggedTask?._id === task._id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
