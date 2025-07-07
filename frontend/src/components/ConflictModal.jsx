"use client"

import { useState } from "react"

const ConflictModal = ({ conflictData, onResolve }) => {
  const [selectedVersion, setSelectedVersion] = useState(null)

  const handleResolve = () => {
    if (selectedVersion === "current") {
      onResolve("continue")
    } else {
      onResolve("cancel")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal conflict-modal">
        <div className="modal-header">
          <h3>Edit Conflict Detected</h3>
        </div>

        <div className="conflict-content">
          <p>
            Another user ({conflictData.currentEditor.username}) is currently editing this task. Please choose how to
            proceed:
          </p>

          <div className="conflict-versions">
            <div
              className={`version-card ${selectedVersion === "current" ? "selected" : ""}`}
              onClick={() => setSelectedVersion("current")}
            >
              <div className="version-header">Continue Editing</div>
              <div className="version-details">
                Continue with your changes. This may overwrite the other user's changes.
              </div>
            </div>

            <div
              className={`version-card ${selectedVersion === "cancel" ? "selected" : ""}`}
              onClick={() => setSelectedVersion("cancel")}
            >
              <div className="version-header">Cancel Edit</div>
              <div className="version-details">
                Cancel your edit and let {conflictData.currentEditor.username} continue.
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn" onClick={handleResolve} disabled={!selectedVersion}>
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
