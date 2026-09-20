# 🚀 ClubOps AI

### AI-Powered Event Operations Platform for College Clubs

ClubOps AI is a centralized event operations platform designed to help college clubs plan, organize, and execute events efficiently.

Instead of managing tasks, volunteers, meetings, documents, risks, and announcements across multiple platforms, ClubOps AI brings everything into one place with AI-assisted workflows.

---

## 🎯 Problem

College clubs often manage events using:

- WhatsApp groups
- Spreadsheets
- Documents
- Meeting notes
- Personal task lists

As an event grows, it becomes difficult to manage:

- Tasks and deadlines
- Task ownership
- Volunteers
- Meetings
- Documents
- Risks
- Announcements
- Event knowledge

ClubOps AI solves this problem by providing a centralized event operations platform.

---

## 💡 Solution

ClubOps AI provides a single platform where club members can manage the complete event lifecycle.

### Core Modules

- 📊 Event Dashboard
- ✅ Event-Based Task Management
- 👥 Volunteer Management
- 📅 Meeting Management
- 📄 Document Repository
- ⚠️ Risk Management
- 📢 Announcements
- 🤖 AI Assistant
- 🔐 Authentication
- 🔑 Google Sign-In
- 🧠 AI-Assisted Event Operations

---

## ✨ Key Features

### 📊 Event Dashboard

Get a quick overview of an event:

- Total tasks
- Completed tasks
- Pending tasks
- Upcoming deadlines
- Volunteers
- Open risks
- Recent activity
- AI insights

### ✅ Event-Based Task Management

Every task belongs to a specific event.

Features:

- Create tasks
- Assign task owners
- Set deadlines
- Set priorities
- Track task status
- Search tasks
- Filter tasks
- Track overdue tasks
- Manage task dependencies

Example:


TechFest 2026
├── Prepare event posters
├── Arrange venue
├── Contact sponsors
└── Configure Wi-Fi
👥 Volunteer Management

Manage volunteers for each event.

Features:

Volunteer profiles
Team assignment
Availability
Workload tracking
Task assignment
Volunteer status
📅 Meeting Management

Manage meetings for each event.

Features:

Schedule meetings
Meeting agenda
Date and time
Location
Meeting type
Participants
View agenda
View members
Edit meetings
Event-specific meetings

Meeting types:

In-person
Online
Hybrid
📄 Documents & Knowledge

Centralized repository for event-related documents.

Possible categories:

Event plans
Meeting notes
Sponsorship documents
Volunteer information
Rules
Budget documents
Other event resources
⚠️ Risk Management

Identify and manage potential event risks.

Risk information includes:

Risk description
Probability
Impact
Severity
Owner
Mitigation plan
Status
📢 Announcements

Create announcements for different groups:

All volunteers
Organizers
Core team
Specific teams

Announcement priorities:

Normal
Important
Urgent

🤖 AI Assistant

The AI assistant is designed to help organizers interact with event information using natural language.

Example queries:
What tasks are overdue?

Who has the highest volunteer workload?

What meetings are coming up?

What are the major risks?

Summarize the latest meeting.

Create a task for Rahul to prepare the event poster by Friday.

🔐 Authentication

ClubOps AI supports an authentication system designed for secure access to the platform.

Authentication includes:

Email/password authentication
Google Sign-In
Protected application routes
User sessions
Logout

Note: Google OAuth requires proper Google Cloud OAuth configuration and environment variables.

🏗️ Architecture
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
        │          │     │          │    │  OAuth   │
        └──────────┘     └──────────┘    └──────────┘

🛠️ Technology Stack
Frontend
React
Vite
JavaScript
Tailwind CSS
React Router
Backend
Node.js
Express.js
Database
MongoDB
Mongoose
Authentication
JWT
Google OAuth 2.0
AI

The platform can integrate with:

Gemini
OpenAI
Claude
Other LLM providers

📁 Project Structure

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
