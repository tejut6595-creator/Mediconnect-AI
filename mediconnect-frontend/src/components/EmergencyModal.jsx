import React, { useState } from 'react';
import { X, Phone, AlertTriangle, Navigation, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const HELPLINES = [
  { name: 'National Emergency', number: '112', icon: '🆘' },
  { name: 'Ambulance', number: '108', icon: '🚑' },
  { name: 'Police', number: '100', icon: '🚔' },
  { name: 'Fire Brigade', number: '101', icon: '🚒' },
  { name: 'Poison Control', number: '1800-116-117', icon: '☠️' },
  { name: 'Mental Health', number: '9152987821', icon: '🧠' },
];

export default function EmergencyModal({ onClose }) {
  const { sendSOS, connected, hospitals, ambulances } = useSocket();
  const navigate = useNavigate();
  const [sosSent, setSosSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableAmbulances = ambulances ? ambulances.filter(a => a.status === 'available').length : 0;

  const handleSendSOS = () => {
    setLoading(true);
    const send = (lat, lng, location) => {
      sendSOS({
        patientName: 'Quick SOS',
        condition: 'Emergency',
        location: location || 'Unknown location',
        lat,
        lng,
        severity: 'critical',
        type: 'Quick SOS',
      });
      setSosSent(true);
      setLoading(false);
      toast.success('SOS sent! Help is on the way.');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => send(pos.coords.latitude, pos.coords.longitude, `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
        () => send(null, null, 'Location unavailable')
      );
    } else {
      send(null, null, 'Location unavailable');
    }
  };

  const handleOpenFull = () => {
    onClose();
    navigate('/emergency');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-red-600 dark:bg-red-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-lg">Emergency</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Connection + Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${connected ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {connected ? 'Connected' : 'Offline'}
            </span>
            <div className="flex gap-3 text-gray-600 dark:text-gray-400">
              <span>🏥 {hospitals ? hospitals.length : 0} hospitals</span>
              <span>🚑 {availableAmbulances} available</span>
            </div>
          </div>

          {/* SOS Button */}
          <div className="flex flex-col items-center gap-3 py-2">
            <button
              onClick={sosSent ? undefined : handleSendSOS}
              disabled={loading || sosSent}
              className={`w-36 h-36 rounded-full font-black text-white text-xl shadow-2xl transition-all flex flex-col items-center justify-center select-none
                ${sosSent
                  ? 'bg-green-500 cursor-default'
                  : loading
                    ? 'bg-red-400 animate-pulse cursor-wait'
                    : 'bg-red-600 hover:bg-red-700 active:scale-95'
                }`}
            >
              {sosSent ? (
                <>
                  <span className="text-3xl">✓</span>
                  <span className="text-sm mt-1">SOS Sent!</span>
                </>
              ) : loading ? (
                <>
                  <Navigation className="w-8 h-8 mb-1 animate-spin" />
                  <span className="text-sm">Locating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-8 h-8 mb-1" />
                  <span className="text-sm leading-tight text-center px-2">SEND SOS NOW</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {sosSent
                ? 'Emergency services have been notified.'
                : 'Tap to instantly alert emergency services with your GPS location.'}
            </p>
          </div>

          {/* Open Full Emergency Center */}
          <button
            onClick={handleOpenFull}
            className="w-full py-2.5 border-2 border-red-500 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Open Full Emergency Center
          </button>

          {/* Helplines */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Quick Helplines
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {HELPLINES.map(h => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                >
                  <span className="text-xl">{h.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{h.name}</div>
                    <div className="text-xs text-red-600 dark:text-red-400 font-bold">{h.number}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
