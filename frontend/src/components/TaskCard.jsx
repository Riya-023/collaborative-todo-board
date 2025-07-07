"use client"

const TaskCard = ({ task, users, onEdit, onDelete, onSmartAssign, onDragStart, isDragging }) => {
  const assignedUser = users.find((user) => user._id === task.assignedTo)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div
      className={`task-card priority-${task.priority.toLowerCase()} ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-actions">
          <button className="task-action-btn smart-assign" onClick={() => onSmartAssign(task._id)} title="Smart Assign">
            🎯
          </button>
          <button className="task-action-btn edit" onClick={() => onEdit(task)} title="Edit Task">
            ✏️
          </button>
          <button className="task-action-btn delete" onClick={() => onDelete(task._id)} title="Delete Task">
            🗑️
          </button>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        <span className={`task-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>

        {assignedUser && (
          <div className="task-assigned">
            <div className="assigned-avatar">{assignedUser.username.charAt(0).toUpperCase()}</div>
            <span>{assignedUser.username}</span>
          </div>
        )}
      </div>

      <div className="task-footer">
        <small>Created: {formatDate(task.createdAt)}</small>
      </div>
    </div>
  )
}

export default TaskCard
