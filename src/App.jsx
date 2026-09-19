import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Volunteers from './pages/Volunteers';
import Meetings from './pages/Meetings';
import Documents from './pages/Documents';
import Risks from './pages/Risks';
import Announcements from './pages/Announcements';
import AiAssistant from './pages/AiAssistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      {/* When user opens root, redirect to /login as starting page */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication Route */}
      <Route path="/login" element={<Login />} />

      {/* Main SaaS App Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/risks" element={<Risks />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback redirect to /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
