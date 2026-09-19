import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Tasks from './pages/Tasks';
import Volunteers from './pages/Volunteers';
import Meetings from './pages/Meetings';
import MeetingDetails from './pages/MeetingDetails';
import Documents from './pages/Documents';
import Risks from './pages/Risks';
import Announcements from './pages/Announcements';
import AIAssistant from './pages/AIAssistant';
import KnowledgeBase from './pages/KnowledgeBase';
import Settings from './pages/Settings';

// Mock Data
import {
  initialEvents,
  initialTasks,
  initialVolunteers,
  initialMeetings,
  initialDocuments,
  initialRisks,
  initialAnnouncements,
  initialKnowledge,
  initialSettings,
  initialDeadlines,
  taskProgress as initialTaskProgress,
  recentActivities as initialActivities,
  aiInsights as initialAiInsights,
} from './data/mockData';

export default function App() {
  const [events, setEvents] = useState(initialEvents);
  const [tasks, setTasks] = useState(initialTasks);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [documents, setDocuments] = useState(initialDocuments);
  const [risks, setRisks] = useState(initialRisks);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const [settings, setSettings] = useState(initialSettings);
  const [deadlines, setDeadlines] = useState(initialDeadlines);
  const [taskProgress, setTaskProgress] = useState(initialTaskProgress);
  const [recentActivities, setRecentActivities] = useState(initialActivities);
  const [aiInsights, setAiInsights] = useState(initialAiInsights);

  const [currentEvent, setCurrentEvent] = useState(events[0]);

  // Handle Event Creation
  const handleCreateEvent = (newEvent) => {
    setEvents([newEvent, ...events]);
    setCurrentEvent(newEvent);
    setRecentActivities([
      {
        id: Date.now(),
        user: 'Prince',
        action: 'created a new event',
        target: newEvent.name,
        time: 'Just now',
      },
      ...recentActivities,
    ]);
  };

  // Handle Task Creation
  const handleCreateTask = (newTask) => {
    setTasks([newTask, ...tasks]);
    setRecentActivities([
      {
        id: Date.now(),
        user: 'Prince',
        action: 'created a new task',
        target: newTask.title,
        time: 'Just now',
      },
      ...recentActivities,
    ]);
  };

  return (
    <Routes>
      <Route
        element={
          <AppLayout
            currentEvent={currentEvent}
            setCurrentEvent={setCurrentEvent}
            events={events}
          />
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              events={events}
              tasks={tasks}
              volunteers={volunteers}
              deadlines={deadlines}
              taskProgress={taskProgress}
              recentActivities={recentActivities}
              aiInsights={aiInsights}
              onCreateEvent={handleCreateEvent}
            />
          }
        />
        <Route
          path="/events"
          element={<Events events={events} onCreateEvent={handleCreateEvent} />}
        />
        <Route
          path="/events/:id"
          element={
            <EventDetails
              events={events}
              tasks={tasks}
              volunteers={volunteers}
              meetings={meetings}
              documents={documents}
              risks={risks}
              announcements={announcements}
              deadlines={deadlines}
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <Tasks
              tasks={tasks}
              setTasks={setTasks}
              onCreateTask={handleCreateTask}
              events={events}
              currentEvent={currentEvent}
            />
          }
        />
        <Route
          path="/volunteers"
          element={<Volunteers volunteers={volunteers} setVolunteers={setVolunteers} />}
        />
        <Route
          path="/meetings"
          element={<Meetings meetings={meetings} setMeetings={setMeetings} />}
        />
        <Route
          path="/meetings/:id"
          element={
            <MeetingDetails
              meetings={meetings}
              setMeetings={setMeetings}
              onCreateTask={handleCreateTask}
            />
          }
        />
        <Route
          path="/documents"
          element={<Documents documents={documents} setDocuments={setDocuments} events={events} />}
        />
        <Route
          path="/risks"
          element={<Risks risks={risks} setRisks={setRisks} />}
        />
        <Route
          path="/announcements"
          element={
            <Announcements
              announcements={announcements}
              setAnnouncements={setAnnouncements}
            />
          }
        />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/knowledge" element={<KnowledgeBase knowledge={knowledge} />} />
        <Route
          path="/settings"
          element={<Settings settings={settings} setSettings={setSettings} />}
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
