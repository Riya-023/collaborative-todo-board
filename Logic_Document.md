# Logic Document: Smart Assign and Conflict Handling

## Smart Assign Implementation

### Overview
The Smart Assign feature automatically assigns tasks to the team member with the fewest number of active tasks, ensuring balanced workload distribution across the team.

### Algorithm Logic

1. **Data Collection**
   - Retrieve all registered users from the database
   - For each user, count their active tasks (tasks with status "Todo" or "In Progress")
   - Create a mapping of users to their active task counts

2. **Selection Process**
   - Compare active task counts across all users
   - Identify the user with the minimum number of active tasks
   - In case of ties, the first user found with the minimum count is selected

3. **Assignment Execution**
   - Update the task's `assignedTo` field with the selected user's ID
   - Update the task's `lastEditedBy` and `lastEditedAt` fields
   - Log the smart assignment action in the activity feed
   - Broadcast the update to all connected clients via Socket.IO

### Example Scenario
\`\`\`
Users and their active task counts:
- Alice: 3 active tasks
- Bob: 1 active task
- Charlie: 2 active tasks

Smart Assign Result: Task assigned to Bob (fewest active tasks)
\`\`\`

### Benefits
- **Load Balancing**: Prevents task overload on individual team members
- **Fairness**: Ensures equitable distribution of work
- **Efficiency**: Reduces manual assignment overhead
- **Transparency**: All assignments are logged and visible to the team

## Conflict Handling Implementation

### Overview
The conflict handling system detects when multiple users attempt to edit the same task simultaneously and provides a user-friendly resolution mechanism.

### Detection Logic

1. **Edit Session Tracking**
   - When a user starts editing a task, their session is registered in a Map structure
   - The Map stores: `taskId -> { user, socketId, timestamp }`
   - Each task can have only one active editing session

2. **Conflict Detection**
   - When a second user attempts to edit the same task:
     - System checks if an active editing session exists
     - If found, a conflict is detected
     - Both users are notified of the conflict

3. **Notification System**
   - Current editor receives: "Another user wants to edit this task"
   - New editor receives: "This task is being edited by [username]"
   - Both users see a conflict resolution modal

### Resolution Options

#### Option 1: Continue Editing
- **Action**: New user proceeds with their edit
- **Consequence**: May overwrite the current editor's changes
- **Use Case**: When the new edit is urgent or more important

#### Option 2: Cancel Edit
- **Action**: New user cancels their edit attempt
- **Consequence**: Current editor continues uninterrupted
- **Use Case**: When respecting the first editor's priority

### Implementation Details

1. **Session Management**
   \`\`\`javascript
   // Start editing
   taskEditSessions.set(taskId, { user, socketId, timestamp });
   
   // Conflict detection
   if (taskEditSessions.has(taskId)) {
     // Emit conflict to both users
   }
   
   // Cleanup on disconnect
   taskEditSessions.delete(taskId);
   \`\`\`

2. **Real-time Communication**
   - Socket.IO events: `start-editing`, `edit-conflict`, `stop-editing`
   - Immediate notification to all relevant parties
   - Automatic cleanup when users disconnect

3. **User Experience**
   - Clear conflict explanation
   - Visual indicators for conflicted tasks
   - Non-blocking resolution (users can choose their action)
   - Graceful fallback if resolution fails

### Example Conflict Scenario

\`\`\`
Timeline:
1. Alice starts editing Task #123 at 10:00 AM
2. Bob attempts to edit Task #123 at 10:01 AM
3. System detects conflict and notifies both users
4. Alice sees: "Bob wants to edit this task"
5. Bob sees: "Alice is currently editing this task"
6. Both users choose their resolution:
   - Alice: Continue editing
   - Bob: Cancel edit
7. Alice continues, Bob's edit is cancelled
8. System logs the conflict resolution
\`\`\`

### Benefits of This Approach

1. **Data Integrity**: Prevents data corruption from simultaneous edits
2. **User Awareness**: Users know when conflicts occur
3. **Flexibility**: Users can choose how to handle conflicts
4. **Transparency**: All conflict resolutions are logged
5. **Real-time**: Immediate feedback and resolution
6. **Graceful**: No data loss or system crashes

### Edge Cases Handled

1. **User Disconnection**: Automatic cleanup of editing sessions
2. **Network Issues**: Timeout-based session cleanup
3. **Multiple Conflicts**: Queue-based conflict resolution
4. **Rapid Edits**: Debouncing to prevent spam conflicts

## Technical Implementation Notes

### Database Considerations
- No database locks required (handled in application layer)
- Optimistic concurrency control
- Activity logging for audit trail

### Performance Optimization
- In-memory session tracking for speed
- Minimal database queries for conflict detection
- Efficient Socket.IO event handling

### Scalability
- Session data stored in application memory (can be moved to Redis for multi-server setup)
- Stateless conflict resolution
- Horizontal scaling friendly architecture

This implementation ensures a smooth collaborative experience while maintaining data integrity and providing users with full control over conflict resolution.
