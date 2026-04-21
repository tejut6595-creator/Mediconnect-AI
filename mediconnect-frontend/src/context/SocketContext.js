import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [liveStats, setLiveStats] = useState({ activeEmergencies: 0, availableAmbulances: 0, onlineDoctors: 0 });

  useEffect(() => {
    const s = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    s.on('initial_data', (data) => {
      setHospitals(data.hospitals || []);
      setAmbulances(data.ambulances || []);
    });

    s.on('emergency_alert', (alert) => {
      setEmergencyAlerts(prev => [{ ...alert, read: false, id: alert.id || `EMG-${Date.now()}` }, ...prev].slice(0, 30));
      setLiveStats(prev => ({ ...prev, activeEmergencies: prev.activeEmergencies + 1 }));
      // Beep
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
      } catch (_) {}
    });

    s.on('hospital_update', (data) => setHospitals(data));
    s.on('ambulance_update', (data) => {
      setAmbulances(data);
      setLiveStats(prev => ({ ...prev, availableAmbulances: data.filter(a => a.status === 'available').length }));
    });
    s.on('sos_received', (data) => {
      setEmergencyAlerts(prev => [{ ...data, type: 'SOS', severity: 'critical', read: false }, ...prev].slice(0, 30));
    });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  const sendSOS = useCallback((data) => { if (socket) socket.emit('patient_sos', data); }, [socket]);
  const reportAccident = useCallback((data) => { if (socket) socket.emit('report_accident', data); }, [socket]);
  const markAlertRead = useCallback((id) => {
    setEmergencyAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const unreadCount = emergencyAlerts.filter(a => !a.read).length;

  return (
    <SocketContext.Provider value={{ socket, connected, emergencyAlerts, hospitals, ambulances, liveStats, sendSOS, reportAccident, markAlertRead, unreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
