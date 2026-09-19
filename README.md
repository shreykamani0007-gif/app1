# ClubOps AI

> **AI-Powered Event Operations Platform for College Clubs**

ClubOps AI is a centralized operations hub designed for student organizations, college clubs, and hackathon teams to coordinate events, tasks, volunteers, meetings, documents, and risks with AI-assisted workflows.

---

## 🌟 Features Implemented (Step 1: Frontend UI)

- **SaaS Dashboard (`/dashboard`)**:
  - Live statistics cards (Total Events, Active Tasks, Pending Tasks, Volunteers, Upcoming Deadlines, Open Risks).
  - Multi-status task progress visualization (Completed, In Progress, Pending, Blocked).
  - Upcoming deadlines with priority tags.
  - Recent activity feed tracking real-time operations.
  - AI Event Insights with contextual action triggers.

- **Event Hub (`/events` & `/events/:id`)**:
  - Event cards with readiness indicators, venue, date, and participant/volunteer counts.
  - Full event details page with sub-navigation tabs (Overview, Tasks, Volunteers, Meetings, Documents, Risks, Announcements).
  - AI Event Planner simulation modal.
  - "Create Event" modal with responsive forms and local state updates.

- **Task Board & Operations (`/tasks`)**:
  - Searchable and filterable task management table.
  - Status filters (`Todo`, `In Progress`, `Completed`, `Blocked`).
  - Priority badges (`Low`, `Medium`, `High`, `Critical`).
  - Owner filters with avatar badges.
  - Real-time task creation, completion toggles, and deletion.

- **Volunteer Management (`/volunteers`)**:
  - Volunteer cards displaying roles, availability (`Available`, `Busy`), assigned task count, and skill badges.
  - Search by name, role, or technical/creative skills.
  - "Add Volunteer" modal.

- **Meetings & Note Extraction (`/meetings` & `/meetings/:id`)**:
  - Meeting overview cards with date, time, attendee counts, and note status.
  - Collaborative meeting notes editor.
  - **✨ Extract Action Items** feature: automatically parses tasks, owners, and deadlines from meeting notes into actionable items.

- **Document Repository (`/documents`)**:
  - Categorized documents (Guidelines, Sponsorship, Operations, Finance).
  - Search and filter by category and event.
  - "Upload Document" modal.

- **Risk Assessment (`/risks`)**:
  - Risk matrix tracking probability, severity, impact, and mitigation steps.
  - **✨ AI Risk Scan** simulation detecting potential event bottlenecks and proposing immediate contingency actions.

- **Club Announcements (`/announcements`)**:
  - Broadcast cards with audience targeting (`Volunteers`, `All Participants`, `Core Team`).
  - **✨ Generate with AI** modal to draft urgent broadcasts and volunteer call times.

- **ClubOps AI Assistant (`/ai-assistant`)**:
  - ChatGPT-style copilot interface with quick-action prompt pills.
  - Generates answers for event planning, task audits, risk analysis, and meeting summaries.

- **Knowledge Base (`/knowledge`)**:
  - Institutional club memory: SOPs, event guidelines, sponsor playbooks, and venue checklists.
  - In-app article reader.

- **Club & User Settings (`/settings`)**:
  - Club profile configuration, user credentials, and interactive notification toggles.

---

## 🛠 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)

---

## 🚀 How to Run the Frontend

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit `http://localhost:5173` to explore the complete ClubOps AI platform.
