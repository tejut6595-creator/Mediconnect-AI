import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'patient', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', dob: '1990-05-15', blood: 'O+', phone: '+1-555-0101' },
  { id: 'u2', name: 'Dr. Sarah Mitchell', email: 'sarah@mediconnect.ai', password: 'doctor123', role: 'doctor', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', specialization: 'Cardiologist' },
];

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem('mc_history')) || []; } catch { return []; }
};

const saveHistory = (h) => localStorage.setItem('mc_history', JSON.stringify(h));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mc_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(loadHistory);

  const login = async (email, password) => {
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 700));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safe } = found;
      setUser(safe);
      localStorage.setItem('mc_user', JSON.stringify(safe));
      setLoading(false);
      return { success: true, user: safe };
    }
    setError('Invalid email or password');
    setLoading(false);
    return { success: false };
  };

  const signup = async (name, email, password, dob, blood, phone) => {
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 900));
    if (MOCK_USERS.find(u => u.email === email)) {
      setError('Email already registered'); setLoading(false); return { success: false };
    }
    const newUser = {
      id: `u${Date.now()}`, name, email, role: 'patient',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`,
      dob, blood, phone,
    };
    MOCK_USERS.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('mc_user', JSON.stringify(newUser));
    setLoading(false);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mc_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('mc_user', JSON.stringify(updated));
  };

  // Add a record to history (symptom check, medicine check, appointment)
  const addToHistory = useCallback((record) => {
    setHistory(prev => {
      const updated = [{ ...record, id: `${record.type}-${Date.now()}`, timestamp: new Date().toISOString() }, ...prev].slice(0, 100);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('mc_history');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateProfile, isAuthenticated: !!user, history, addToHistory, clearHistory }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
