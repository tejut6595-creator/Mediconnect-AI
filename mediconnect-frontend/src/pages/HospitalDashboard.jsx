import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Activity, Users, Truck, AlertTriangle, MapPin, Clock, TrendingUp, Bell, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const HospitalDashboard = () => {
  const { connected, emergencyAlerts, hospitals, ambulances, liveStats, markAlertRead } = useSocket();
  const [filter, setFilter] = useState('all');

  const filteredAlerts = emergencyAlerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'unread') return !a.read;
    return true;
  });

  const severityColors = {
    critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-500' },
    high: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-500' },
    moderate: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-500' },
  };

  const handleAccept = (alert) => {
    toast.success(`Emergency ${alert.id} accepted! Dispatching Truck...`);
    markAlertRead(alert.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-900 to-orange-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="w-8 h-8 text-white" />
                <h1 className="text-4xl font-black text-white">Hospital Command Center</h1>
              </div>
              <p className="text-red-200">Real-time emergency monitoring & response system</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white font-semibold">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Emergencies</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{liveStats.activeEmergencies}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Available Ambulances</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{liveStats.availableAmbulances}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Online Hospitals</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{hospitals.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Unread Alerts</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{emergencyAlerts.filter(a => !a.read).length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emergency Alerts Feed */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Live Emergency Alerts</h2>
                </div>
                <div className="flex space-x-2">
                  {['all', 'critical', 'unread'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        filter === f ? 'bg-white text-red-600' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-20">
                  <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No active emergencies</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const config = severityColors[alert.severity] || severityColors.moderate;
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border-2 ${config.border} ${config.bg} transition-all hover:shadow-md cursor-pointer ${
                        !alert.read ? 'ring-2 ring-red-300' : ''
                      }`}
                      onClick={() => { setSelectedAlert(alert); markAlertRead(alert.id); }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${config.badge} ${!alert.read ? 'animate-pulse' : ''}`} />
                          <span className={`font-bold ${config.text} text-sm`}>{alert.type || 'Emergency'}</span>
                          <span className={`px-2 py-0.5 ${config.badge} text-white text-xs rounded-full font-bold uppercase`}>
                            {alert.severity}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>

                      <div className="space-y-1 text-sm">
                        {alert.patientAge && <p className="text-gray-600">Patient Age: <span className="font-semibold">{alert.patientAge} years</span></p>}
                        {alert.location && (
                          <div className="flex items-center space-x-1 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.location}</span>
                          </div>
                        )}
                        {alert.respondingUnit && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Truck className="w-3 h-3" />
                            <span className="font-semibold">{alert.respondingUnit} dispatched</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAccept(alert); }}
                          className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-xl hover:shadow-md transition-all"
                        >
                          Accept & Respond
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast('Forwarded to next hospital'); }}
                          className="px-4 py-2 bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-300 transition-all"
                        >
                          Forward
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live Map & ambulances */}
          <div className="space-y-6">
            {/* Hospitals Status */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                <h3 className="font-bold flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Nearby Hospitals</span>
                </h3>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {hospitals.map((h) => (
                  <div key={h.id} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-gray-800">{h.name}</p>
                      <span className={`w-2 h-2 rounded-full ${h.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>{h.beds || 0} beds</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Activity className="w-3 h-3" />
                        <span>{h.doctors || 0} doctors</span>
                      </div>
                    </div>
                    {h.waitTime && (
                      <div className="flex items-center space-x-1 text-xs text-orange-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>~{h.waitTime} min wait</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ambulances Status */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
                <h3 className="font-bold flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Live Ambulances</span>
                </h3>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {ambulances.map((amb) => (
                  <div key={amb.id} className={`p-3 rounded-xl border ${
                    amb.status === 'available' ? 'bg-green-50 border-green-200' :
                    amb.status === 'en-route' ? 'bg-orange-50 border-orange-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-gray-800">{amb.id}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        amb.status === 'available' ? 'bg-green-500 text-white' :
                        amb.status === 'en-route' ? 'bg-orange-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {amb.status}
                      </span>
                    </div>
                    {amb.speed > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>{amb.speed} km/h</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
