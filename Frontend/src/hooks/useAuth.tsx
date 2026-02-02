import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  getAllUsers: () => User[];
  deleteUser: (username: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'chat_users';
const SESSION_KEY = 'chat_session';

interface StoredUser {
  username: string;
  password: string;
  role: 'user' | 'admin';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const register = (username: string, password: string): boolean => {
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return false;
    }
    // First user becomes admin
    const isFirstUser = users.length === 0;
    const newUser: StoredUser = {
      username,
      password,
      role: isFirstUser ? 'admin' : 'user',
    };
    saveUsers([...users, newUser]);
    const sessionUser: User = { username: newUser.username, role: newUser.role };
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return true;
  };

  const login = (username: string, password: string): boolean => {
    const users = getUsers();
    const found = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (found) {
      const sessionUser: User = { username: found.username, role: found.role };
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const getAllUsers = (): User[] => {
    return getUsers().map(u => ({ username: u.username, role: u.role }));
  };

  const deleteUser = (username: string): boolean => {
    const users = getUsers();
    const filtered = users.filter(u => u.username !== username);
    saveUsers(filtered);
    return true;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, isAdmin, getAllUsers, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
