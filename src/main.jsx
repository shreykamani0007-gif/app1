import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { AiChatProvider } from './context/AiChatContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <AiChatProvider>
            <App />
          </AiChatProvider>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
