# 🚀 ClubOps AI

### AI-Powered Event Operations Platform for College Clubs

ClubOps AI is a centralized AI-powered event operations platform designed to help college clubs plan, organize, and execute events efficiently.

<<<<<<< HEAD
Instead of managing tasks, volunteers, meetings, documents, risks, and announcements across multiple platforms, ClubOps AI brings everything into one place.
=======
Instead of managing tasks, volunteers, meetings, documents, risks, and announcements across multiple platforms, ClubOps AI brings everything into one place with AI-assisted workflows in one centralized platform.
>>>>>>> d4b862a (Update README)

---

## 🎯 Problem Statement

College clubs often manage events using:

* WhatsApp groups
* Spreadsheets
* Documents
* Meeting notes
* Personal task lists

As events grow, it becomes difficult to manage:

* Tasks and deadlines
* Task ownership
* Volunteers
* Meetings
* Documents
* Risks
* Announcements
* Event knowledge

ClubOps AI provides a centralized platform to solve these challenges.

---

## 💡 Solution

ClubOps AI provides a single platform for managing the complete event lifecycle.

### Core Modules

* 📊 Event Dashboard
* ✅ Task Management
* 👥 Volunteer Management
* 📅 Meeting Management
* 📄 Document Repository
* ⚠️ Risk Management
* 📢 Announcements
* 🤖 AI Assistant
* 🔐 Authentication
* 🔑 Google Sign-In

---

# ✨ Key Features

## 📊 Event Dashboard

Provides a quick overview of an event:

* Total tasks
* Completed tasks
* Pending tasks
* Upcoming deadlines
* Volunteers
* Open risks
* Recent activity
* AI insights

---

## ✅ Event-Based Task Management

Every task belongs to a specific event.

Features:

* Create tasks
* Assign task owners
* Set deadlines
* Set priorities
* Track task status
* Search and filter tasks
* Track overdue tasks
* Manage task dependencies

### Example

```text
TechFest 2026
├── Prepare event posters
├── Arrange venue
├── Contact sponsors
└── Configure Wi-Fi
```

---

## 👥 Volunteer Management

Manage volunteers and their responsibilities.

Features:

* Volunteer profiles
* Team assignment
* Availability
* Workload tracking
* Task assignment
* Volunteer status

---

## 📅 Meeting Management

Manage event-related meetings from one place.

Features:

* Schedule meetings
* Meeting agenda
* Date and time
* Location
* Meeting type
* Participants
* View agenda
* View members
* Edit meetings
* Event-specific meetings

### Meeting Types

* In-person
* Online
* Hybrid

---

## 📄 Documents & Knowledge

Centralized repository for event-related information.

Possible categories:

* Event plans
* Meeting notes
* Sponsorship documents
* Volunteer information
* Rules
* Budget documents
* Other event resources

---

## ⚠️ Risk Management

Identify and manage potential event risks.

Risk information includes:

* Risk description
* Probability
* Impact
* Severity
* Owner
* Mitigation plan
* Status

---

## 📢 Announcements

Create announcements for different groups.

### Target Groups

* All volunteers
* Organizers
* Core team
* Specific teams

### Priorities

* Normal
* Important
* Urgent

---

# 🤖 AI Assistant

The AI Assistant allows organizers to interact with event information using natural language.

### Example Queries

```text
What tasks are overdue?

Who has the highest volunteer workload?

What meetings are coming up?

What are the major risks?

Summarize the latest meeting.

Create a task for Rahul to prepare the event poster by Friday.
```

The AI Assistant helps organizers quickly access event information and perform event-related actions.

---

# 🔐 Authentication

ClubOps AI provides secure user authentication with:

* Email/password authentication
* JWT-based authentication
* Google Sign-In
* Protected routes
* User sessions
* Logout

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │
                            REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Node.js + Express  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐     ┌──────────┐    ┌──────────┐
        │ MongoDB  │     │ AI Layer │    │   Auth   │
        └──────────┘     └──────────┘    └──────────┘
```

---

# 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT
* Google OAuth

### AI

* AI-powered natural language assistant

---

# 📁 Project Structure

```text
ClubOps-AI/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
<<<<<<< HEAD
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/shreykamani0007-gif/app1.git
cd app1
```

## 2. Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

## 3. Run the Application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

---

# 🔄 How ClubOps AI Works

```text
Create Event
     │
     ▼
Create Tasks
     │
     ▼
Assign Volunteers
     │
     ▼
Schedule Meetings
     │
     ▼
Manage Risks
     │
     ▼
Store Documents
     │
     ▼
Send Announcements
     │
     ▼
Use AI Assistant
     │
     ▼
Get Event Insights
```

---

# 🔮 Future Improvements

* 📱 Mobile application
* 🔔 Real-time notifications
* 📊 Advanced analytics
* 🧠 Advanced AI agents
* 🎤 AI meeting transcription
* 📈 Predictive risk analysis
* 🔗 Calendar integration
* 💬 WhatsApp/Discord integration
* 📧 Email notifications

---

# 👨‍💻 Team

## Team Code Warrier

**Team Leader:** Shrey Kamani

**Team Member:** Prince Ghinaiya

---

# 🏆 Hackathon Project

**Problem Statement:** PS-3 — ClubOps AI

ClubOps AI was developed as a hackathon project to demonstrate how AI can simplify and centralize event operations for college clubs.

---

# 📌 Repository

GitHub: https://github.com/shreykamani0007-gif/app1

---

# 📄 License

This project is developed for educational and hackathon purposes.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
=======

>>>>>>> d4b862a (Update README)
