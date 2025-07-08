# Real-Time Collaborative To-Do Board

A full-stack MERN application that enables multiple users to collaborate on tasks in real-time, featuring a Kanban-style board with drag-and-drop functionality, smart task assignment, and conflict resolution.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Real-time Collaboration**: Live updates using Socket.IO
- **Kanban Board**: Drag-and-drop task management across Todo, In Progress, and Done columns
- **Task Management**: Create, edit, delete, and assign tasks
- **Activity Logging**: Track all user actions with timestamps
- **Smart Assignment**: Automatically assign tasks to users with the fewest active tasks
- **Conflict Resolution**: Handle simultaneous edits with user-friendly resolution options

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Custom Animations**: Smooth transitions and visual feedback
- **Real-time Sync**: All changes are instantly visible to all connected users
- **Data Validation**: Unique task titles and proper input validation
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Vanilla CSS** - Custom styling (no frameworks)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file with the following variables:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/collaborative-todo
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:5173
   PORT=5000
   \`\`\`

4. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup
1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file (optional):
   \`\`\`env
   VITE_SERVER_URL=http://localhost:5000
   \`\`\`

4. Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Running Both Servers Concurrently
From the root directory:
\`\`\`bash
npm install
npm run dev
\`\`\`

## 🎯 Usage Guide

### Getting Started
1. **Register**: Create a new account with username, email, and password
2. **Login**: Access your dashboard with your credentials
3. **Create Tasks**: Click "Add Task" to create new tasks with title, description, priority, and assignment
4. **Manage Tasks**: Drag and drop tasks between columns, edit details, or delete tasks
5. **Smart Assign**: Use the target icon (🎯) to automatically assign tasks to the user with the fewest active tasks
6. **Monitor Activity**: View real-time activity feed showing all user actions

### Key Features Explained

#### Smart Assign Logic
The Smart Assign feature automatically assigns tasks to the user with the fewest number of active tasks (Todo + In Progress). This ensures balanced workload distribution across team members.

**Implementation:**
1. Counts active tasks for each user
2. Identifies user with minimum active tasks
3. Assigns the task to that user
4. Logs the action in the activity feed

#### Conflict Handling
When two users attempt to edit the same task simultaneously:
1. The system detects the conflict
2. Both users receive a conflict notification
3. Users can choose to:
   - Continue editing (may overwrite other changes)
   - Cancel their edit (let the other user continue)
4. The resolution is handled gracefully without data loss

#### Real-time Features
- **Live Updates**: All task changes appear instantly for all users
- **User Presence**: See when other users join or leave
- **Activity Stream**: Real-time activity feed with user actions
- **Conflict Notifications**: Immediate alerts for editing conflicts


## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px

Key responsive features:
- Collapsible navigation on mobile
- Stacked columns on smaller screens
- Touch-friendly interactions
- Optimized modal sizes

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific origins
- **XSS Prevention**: Proper data sanitization

## 🚀 Deployed Link

### Backend Deployment (Render)
https://todo-backend-x7qg.onrender.com

### Frontend Deployment (Netlify)


### Environment Variables for Production
\`\`\`env
# Backend
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
PORT=5000

# Frontend
VITE_SERVER_URL=https://your-backend-domain.com
\`\`\`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login




