import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Phone, Truck, Navigation, Search, Clock, CheckCircle, Zap, Activity, Users, Radio } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const ACCIDENT_TYPES = [
  'Road Accident', 'Fall Injury', 'Fire Incident',
  'Drowning', 'Electric Shock', 'Building Collapse', 'Other'
];

const HELPLINES = [
  { name: 'National Emergency', number: '112', icon: '🆘', color: 'red', desc: 'All emergencies' },
  { name: 'Ambulance', number: '108', icon: '🚑', color: 'green', desc: 'Medical emergency' },
  { name: 'Police', number: '100', icon: '🚔', color: 'blue', desc: 'Law enforcement' },
  { name: 'Fire Brigade', number: '101', icon: '🚒', color: 'orange', desc: 'Fire emergency' },
  { name: 'Disaster Mgmt', number: '1078', icon: '⛑️', color: 'purple', desc: 'Natural disasters' },
  { name: 'Poison Control', number: '1800-116-117', icon: '☠️', color: 'yellow', desc: 'Poisoning cases' },
  { name: 'Women Helpline', number: '1091', icon: '👩', color: 'pink', desc: 'Women safety' },
  { name: 'Mental Health', number: '9152987821', icon: '🧠', color: 'teal', desc: 'Crisis support' },
];

const COLOR_MAP = {
  red: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300',
  green: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300',
  blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
  orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300',
  purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300',
  pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300',
  teal: 'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300',
};

export default function Emergency() {
  const { connected, emergencyAlerts, hospitals, ambulances, sendSOS, reportAccident, markAlertRead } = useSocket();

  const [activeTab, setActiveTab] = useState('sos');
  const [countdown, setCountdown] = useState(null);
  const [sosSent, setSosSent] = useState(false);
  const [sosForm, setSosForm] = useState({ name: '', condition: '', location: '', lat: null, lng: null });
  const [accidentForm, setAccidentForm] = useState({ type: '', location: '', injured: 1, description: '' });
  const [helpSearch, setHelpSearch] = useState('');
  const countdownRef = useRef(null);
  const circleRef = useRef(null);

  const availableAmbulances = ambulances ? ambulances.filter(a => a.status === 'available').length : 0;

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const startSOS = () => {
    if (sosSent) return;
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          handleSendSOS();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
    toast('SOS cancelled', { icon: '✋' });
  };

  const handleSendSOS = () => {
    sendSOS({
      patientName: sosForm.name || 'Unknown',
      condition: sosForm.condition || 'Emergency',
      location: sosForm.location || 'Unknown location',
      lat: sosForm.lat,
      lng: sosForm.lng,
      severity: 'critical',
      type: 'SOS Alert',
    });
    setSosSent(true);
    toast.success('SOS sent! Help is on the way.');
  };

  const getGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    toast.loading('Getting location...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        toast.dismiss();
        setSosForm(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
        toast.success('Location captured');
      },
      () => { toast.dismiss(); toast.error('Could not get location'); }
    );
  };

  const handleReportAccident = () => {
    if (!accidentForm.type) { toast.error('Select accident type'); return; }
    if (!accidentForm.location) { toast.error('Enter location'); return; }
    reportAccident(accidentForm);
    toast.success('Accident reported. Authorities notified.');
    setAccidentForm({ type: '', location: '', injured: 1, description: '' });
  };

  const filteredHelplines = HELPLINES.filter(h =>
    h.name.toLowerCase().includes(helpSearch.toLowerCase()) ||
    h.number.includes(helpSearch)
  );

  // SVG circle animation values
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = countdown !== null ? ((5 - countdown) / 5) * circumference : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-red-600 dark:bg-red-800 text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            <h1 className="text-xl font-bold">Emergency Center</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-500'}`}>
              <Radio className="w-3 h-3" />
              {connected ? 'Live' : 'Offline'}
            </span>
            <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
              <Activity className="w-3 h-3" />
              {hospitals ? hospitals.length : 0} Hospitals
            </span>
            <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
              <Truck className="w-3 h-3" />
              {availableAmbulances} Ambulances
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow mb-6">
            {[
              { id: 'sos', label: 'SOS Alert', icon: <Zap className="w-4 h-4" /> },
              { id: 'accident', label: 'Report Accident', icon: <AlertTriangle className="w-4 h-4" /> },
              { id: 'help', label: 'Find Help', icon: <Phone className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* SOS Tab */}
          {activeTab === 'sos' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                {/* SOS Button with SVG countdown ring */}
                <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
                  {countdown !== null && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={radius} fill="none" stroke="#fee2e2" strokeWidth="6" />
                      <circle
                        ref={circleRef}
                        cx="60" cy="60" r={radius}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                  )}
                  <button
                    onClick={sosSent ? undefined : countdown !== null ? cancelSOS : startSOS}
                    disabled={sosSent}
                    style={{ width: 140, height: 140 }}
                    className={`rounded-full font-black text-white text-2xl shadow-2xl transition-all select-none z-10 flex flex-col items-center justify-center
                      ${sosSent
                        ? 'bg-green-500 cursor-default'
                        : countdown !== null
                          ? 'bg-red-400 animate-pulse'
                          : 'bg-red-600 hover:bg-red-700 active:scale-95'
                      }`}
                  >
                    {sosSent ? (
                      <>
                        <CheckCircle className="w-8 h-8 mb-1" />
                        <span className="text-base">SENT</span>
                      </>
                    ) : countdown !== null ? (
                      <>
                        <span className="text-4xl font-black">{countdown}</span>
                        <span className="text-xs mt-1">TAP TO CANCEL</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-8 h-8 mb-1" />
                        <span>SOS</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {sosSent
                    ? 'Emergency services have been notified.'
                    : countdown !== null
                      ? 'Sending SOS in ' + countdown + 's... Tap button to cancel'
                      : 'Tap the SOS button to send an emergency alert'}
                </p>
              </div>

              {/* SOS Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={sosForm.name}
                    onChange={e => setSosForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. Chest pain, Unconscious"
                    value={sosForm.condition}
                    onChange={e => setSosForm(f => ({ ...f, condition: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Address or coordinates"
                      value={sosForm.location}
                      onChange={e => setSosForm(f => ({ ...f, location: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={getGPS}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      GPS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Accident Tab */}
          {activeTab === 'accident' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Report an Accident
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accident Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCIDENT_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setAccidentForm(f => ({ ...f, type }))}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        accidentForm.type === type
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Where did it happen?"
                  value={accidentForm.location}
                  onChange={e => setAccidentForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Injured</label>
                <input
                  type="number"
                  min="1"
                  value={accidentForm.injured}
                  onChange={e => setAccidentForm(f => ({ ...f, injured: parseInt(e.target.value) || 1 }))}
                  className="w-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what happened..."
                  value={accidentForm.description}
                  onChange={e => setAccidentForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <button
                onClick={handleReportAccident}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Report Accident
              </button>
            </div>
          )}

          {/* Find Help Tab */}
          {activeTab === 'help' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                Emergency Helplines
              </h2>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search helplines..."
                  value={helpSearch}
                  onChange={e => setHelpSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredHelplines.map(h => (
                  <a
                    key={h.number}
                    href={`tel:${h.number}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${COLOR_MAP[h.color]}`}
                  >
                    <span className="text-2xl">{h.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{h.name}</div>
                      <div className="text-xs opacity-75">{h.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{h.number}</div>
                      <div className="text-xs opacity-75 flex items-center gap-1 justify-end">
                        <Phone className="w-3 h-3" /> Call
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-80 space-y-4">
          {/* Live Emergency Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              Live Emergency Feed
            </h3>
            {emergencyAlerts && emergencyAlerts.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emergencyAlerts.map((alert, i) => (
                  <div
                    key={alert.id || i}
                    onClick={() => markAlertRead && markAlertRead(alert.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      alert.read
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                        : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {alert.type || 'Emergency Alert'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alert.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {!alert.read && <span className="w-2 h-2 rounded-full bg-red-500" />}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.time || 'Now'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active alerts</p>
              </div>
            )}
          </div>

          {/* Nearest Hospitals */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-blue-500" />
              Nearest Hospitals
            </h3>
            {hospitals && hospitals.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {hospitals.slice(0, 5).map((h, i) => (
                  <div key={h.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                      <span className="text-sm">🏥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{h.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{h.distance || 'Nearby'}</p>
                    </div>
                    {h.phone && (
                      <a href={`tel:${h.phone}`} className="text-blue-500 hover:text-blue-600">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No hospitals data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
