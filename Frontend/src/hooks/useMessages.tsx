import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

const MESSAGES_KEY = 'chat_messages';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  const loadMessages = useCallback(() => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 500ms (simulates real-time)
    const interval = setInterval(loadMessages, 500);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const sendMessage = (userId: string, username: string, content: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      userId,
      username,
      content,
      timestamp: Date.now(),
    };
    const stored = localStorage.getItem(MESSAGES_KEY);
    const current = stored ? JSON.parse(stored) : [];
    const updated = [...current, newMessage];
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    setMessages(updated);
  };

  const deleteMessage = (messageId: string) => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const current: Message[] = stored ? JSON.parse(stored) : [];
    const updated = current.filter(m => m.id !== messageId);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    setMessages(updated);
  };

  const deleteUserMessages = (username: string) => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const current: Message[] = stored ? JSON.parse(stored) : [];
    const updated = current.filter(m => m.username !== username);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    setMessages(updated);
  };

  return { messages, sendMessage, deleteMessage, deleteUserMessages };
}
