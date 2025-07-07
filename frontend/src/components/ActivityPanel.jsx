"use client"

import { useEffect, useState } from "react"

const ActivityPanel = ({ activities }) => {
  const [newActivityIds, setNewActivityIds] = useState(new Set())

  useEffect(() => {
    if (activities.length > 0) {
      const latestActivity = activities[0]
      setNewActivityIds((prev) => new Set([...prev, latestActivity._id]))

      // Remove the "new" class after animation
      setTimeout(() => {
        setNewActivityIds((prev) => {
          const updated = new Set(prev)
          updated.delete(latestActivity._id)
          return updated
        })
      }, 3000)
    }
  }, [activities])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getActionIcon = (action) => {
    switch (action) {
      case "created":
        return "➕"
      case "updated":
        return "✏️"
      case "deleted":
        return "🗑️"
      case "assigned":
        return "👤"
      case "moved":
        return "↔️"
      case "smart-assigned":
        return "🎯"
      default:
        return "📝"
    }
  }

  return (
    <div className="activity-panel">
      <div className="activity-header">
        <h3>Recent Activity</h3>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className={`activity-item ${newActivityIds.has(activity._id) ? "new" : ""}`}>
              <div className="activity-content">
                <span className="activity-icon">{getActionIcon(activity.action)}</span>
                <div className="activity-info">
                  <div className="activity-user">{activity.username}</div>
                  <div className="activity-details">{activity.details}</div>
                  <div className="activity-time">{formatTime(activity.timestamp)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ActivityPanel
