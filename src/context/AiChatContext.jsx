import React, { createContext, useContext, useState, useEffect } from 'react';

const AiChatContext = createContext();

const STORAGE_KEY_MESSAGES = 'clubops_ai_chat_messages';
const STORAGE_KEY_WORKFLOW = 'clubops_ai_schedule_workflow';
const STORAGE_KEY_INPUT = 'clubops_ai_input_val';

export const getInitialGreeting = () => ({
  id: 'welcome-msg',
  role: 'assistant',
  content: "Hello! How can I help you today? Feel free to ask general questions or anything related to your club's active event.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export function AiChatProvider({ children }) {
  // Initialize messages from localStorage or default greeting
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved AI chat messages from localStorage:', e);
    }
    return [getInitialGreeting()];
  });

  // Initialize schedule workflow from localStorage or default idle state
  const [scheduleWorkflow, setScheduleWorkflow] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKFLOW);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved schedule workflow from localStorage:', e);
    }
    return { step: 'idle', data: {} };
  });

  // Initialize draft input value from localStorage
  const [inputVal, setInputVal] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_INPUT) || '';
    } catch {
      return '';
    }
  });

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save AI chat messages to localStorage:', e);
    }
  }, [messages]);

  // Sync scheduleWorkflow to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKFLOW, JSON.stringify(scheduleWorkflow));
    } catch (e) {
      console.warn('Failed to save schedule workflow to localStorage:', e);
    }
  }, [scheduleWorkflow]);

  // Sync input draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INPUT, inputVal);
    } catch (e) {
      console.warn('Failed to save inputVal to localStorage:', e);
    }
  }, [inputVal]);

  // Clear chat conversation
  const clearChat = () => {
    const freshGreeting = [getInitialGreeting()];
    setMessages(freshGreeting);
    setScheduleWorkflow({ step: 'idle', data: {} });
    setInputVal('');
    try {
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_WORKFLOW);
      localStorage.removeItem(STORAGE_KEY_INPUT);
    } catch (e) {
      console.warn('Failed to clear localStorage for AI chat:', e);
    }
  };

  return (
    <AiChatContext.Provider
      value={{
        messages,
        setMessages,
        scheduleWorkflow,
        setScheduleWorkflow,
        inputVal,
        setInputVal,
        clearChat,
        getInitialGreeting,
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat() {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error('useAiChat must be used within an AiChatProvider');
  }
  return context;
}
