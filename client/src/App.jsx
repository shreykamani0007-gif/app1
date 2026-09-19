import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { Tasks } from './pages/Tasks';
import { Volunteers } from './pages/Volunteers';
import { Meetings } from './pages/Meetings';
import { Documents } from './pages/Documents';
import { Risks } from './pages/Risks';
import { Announcements } from './pages/Announcements';
import { Knowledge } from './pages/Knowledge';
import { AiAssistant } from './pages/AiAssistant';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Main App Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/ai" element={<AiAssistant />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
