import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../context/SocketContext';
import { Activity, Truck, MapPin, RefreshCw, Navigation, AlertTriangle } from 'lucide-react';

// ── Fix Leaflet default icon paths broken by webpack ──────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom map icons ──────────────────────────────────────────────────────────
const makeIcon = (html, size = 40) => L.divIcon({
  html,
  className: '',
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
  popupAnchor: [0, -(size / 2)],
});

const HOSPITAL_ICON = makeIcon(
  `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);
   display:flex;align-items:center;justify-content:center;border:3px solid white;
   box-shadow:0 4px 15px rgba(37,99,235,0.5);font-size:18px;cursor:pointer;">🏥</div>`, 40
);

const BUSY_HOSPITAL_ICON = makeIcon(
  `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#9f1239);
   display:flex;align-items:center;justify-content:center;border:3px solid white;
   box-shadow:0 4px 15px rgba(220,38,38,0.5);font-size:18px;cursor:pointer;">🏥</div>`, 40
);

const ambIcon = (status) => makeIcon(
  `<div style="width:34px;height:34px;border-radius:10px;
   background:${status === 'available' ? '#10b981' : status === 'en-route' ? '#f59e0b' : '#ef4444'};
   display:flex;align-items:center;justify-content:center;border:2px solid white;
   box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:16px;">🚑</div>`, 34
);

const USER_ICON = makeIcon(
  `<div style="width:30px;height:30px;border-radius:50%;background:#ef4444;
   display:flex;align-items:center;justify-content:center;border:3px solid white;
   box-shadow:0 4px 12px rgba(239,68,68,0.5);font-size:14px;">📍</div>`, 30
);

const SOS_ICON = makeIcon(
  `<div style="width:36px;height:36px;border-radius:50%;background:#dc2626;
   display:flex;align-items:center;justify-content:center;border:3px solid white;
   box-shadow:0 0 20px rgba(220,38,38,0.8);font-size:16px;animation:pulse 1s infinite;">🆘</div>`, 36
);

// ── Recenter helper ───────────────────────────────────────────────────────────
const FlyTo = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// ── Main Component ────────────────────────────────────────────────────────────
const LiveMap = () => {
  const { hospitals, ambulances, emergencyAlerts, connected } = useSocket();
  const [userPos, setUserPos]           = useState([12.9716, 77.5946]);
  const [flyTarget, setFlyTarget]       = useState(null);
  const [locating, setLocating]         = useState(false);
  const [filter, setFilter]             = useState('all');
  const [selectedHospital, setSelected] = useState(null);
  const [showSOS, setShowSOS]           = useState(false);
  const mapRef = useRef(null);

  // Auto-detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setFlyTarget(coords);
      },
      () => {}
    );
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setFlyTarget(coords);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const flyToHospital = (h) => {
    setSelected(h);
    setFlyTarget([h.lat, h.lng]);
  };

  const displayHospitals = (hospitals || []).filter(h =>
    filter === 'all' || h.status === filter
  );

  const availableAmb = (ambulances || []).filter(a => a.status === 'available').length;
  const activeAlerts = (emergencyAlerts || []).filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-900 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <MapPin className="w-7 h-7" /> Live Hospital Map
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">Real-time hospital & ambulance tracking via OpenStreetMap</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${connected ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              {connected ? 'Live' : 'Offline'}
            </span>
            <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-semibold">🏥 {displayHospitals.length} hospitals</span>
            <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-semibold">🚑 {availableAmb} available</span>
            {activeAlerts > 0 && (
              <span className="bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                🚨 {activeAlerts} alerts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
          {/* Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {[
              { id: 'all',    label: 'All' },
              { id: 'active', label: '🟢 Available' },
              { id: 'busy',   label: '🔴 Busy' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>{f.label}</button>
            ))}
          </div>

          {/* My location */}
          <button onClick={getLocation} disabled={locating}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-60">
            {locating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            My Location
          </button>

          {/* SOS toggle */}
          <button onClick={() => setShowSOS(!showSOS)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${showSOS ? 'bg-red-600 text-white' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {showSOS ? 'Hide SOS' : 'Show SOS Alerts'}
          </button>

          {/* Legend */}
          <div className="ml-auto hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">🏥 Hospital</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded-sm inline-block" /> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm inline-block" /> En-Route</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm inline-block" /> At Scene</span>
            <span className="flex items-center gap-1">📍 You</span>
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">

          {/* MAP */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700"
            style={{ height: '560px' }}>
            <MapContainer
              center={userPos}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              zoomControl={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {/* Fly to target */}
              {flyTarget && <FlyTo center={flyTarget} />}

              {/* User location */}
              <Marker position={userPos} icon={USER_ICON}>
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-sm">📍 Your Location</p>
                    <p className="text-xs text-gray-500 mt-1">{userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>

              {/* 3km radius ring */}
              <Circle
                center={userPos}
                radius={3000}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.04, weight: 1.5, dashArray: '6,6' }}
              />

              {/* Hospitals */}
              {displayHospitals.map(h => (
                <Marker
                  key={h.id}
                  position={[h.lat, h.lng]}
                  icon={h.status === 'active' ? HOSPITAL_ICON : BUSY_HOSPITAL_ICON}
                  eventHandlers={{ click: () => flyToHospital(h) }}
                >
                  <Popup minWidth={200}>
                    <div className="p-1">
                      <p className="font-bold text-gray-900 text-sm mb-1">{h.name}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <span className={`w-2 h-2 rounded-full ${h.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-xs text-gray-600 capitalize">{h.status}</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>🛏️ <strong>{h.beds}</strong> beds available</p>
                        <p>👨‍⚕️ <strong>{h.doctors}</strong> doctors on duty</p>
                        {h.waitTime && <p>⏱️ ~<strong>{h.waitTime}</strong> min wait</p>}
                        {h.occupancy && <p>📊 <strong>{h.occupancy}%</strong> occupancy</p>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Ambulances */}
              {(ambulances || []).map(amb => (
                <Marker key={amb.id} position={[amb.lat, amb.lng]} icon={ambIcon(amb.status)}>
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-sm">{amb.id}</p>
                      <p className="text-xs text-gray-600 capitalize mt-1">Status: <strong>{amb.status}</strong></p>
                      {amb.speed > 0 && <p className="text-xs text-gray-600">Speed: <strong>{amb.speed} km/h</strong></p>}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* SOS alerts on map */}
              {showSOS && (emergencyAlerts || []).filter(a => a.lat && a.lng).map((alert, i) => (
                <Marker key={alert.id || i} position={[alert.lat, alert.lng]} icon={SOS_ICON}>
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-red-600 text-sm">🚨 {alert.type || 'SOS Alert'}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.location || 'Unknown location'}</p>
                      <p className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* SIDEBAR */}
          <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '560px' }}>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow text-center border border-gray-100 dark:border-gray-700">
                <p className="text-2xl font-black text-blue-600">{displayHospitals.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hospitals</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow text-center border border-gray-100 dark:border-gray-700">
                <p className="text-2xl font-black text-green-600">{availableAmb}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Available</p>
              </div>
            </div>

            {/* Hospital list */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-100 dark:border-gray-700 flex-1">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-3 py-2.5 text-white">
                <p className="font-bold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Hospitals
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto" style={{ maxHeight: '200px' }}>
                {displayHospitals.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">No hospitals found</p>
                ) : displayHospitals.map(h => (
                  <button key={h.id} onClick={() => flyToHospital(h)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${selectedHospital?.id === h.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{h.name}</p>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${h.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">🛏️ {h.beds} beds • 👨‍⚕️ {h.doctors} docs</p>
                    {h.waitTime && <p className="text-xs text-orange-500 mt-0.5">⏱️ ~{h.waitTime} min</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambulances */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 px-3 py-2.5 text-white">
                <p className="font-bold text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Ambulances
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto" style={{ maxHeight: '160px' }}>
                {(ambulances || []).map(amb => (
                  <div key={amb.id} className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{amb.id}</p>
                      {amb.speed > 0 && <p className="text-xs text-gray-400">🚀 {amb.speed} km/h</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      amb.status === 'available' ? 'bg-green-100 text-green-700' :
                      amb.status === 'en-route'  ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{amb.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live SOS alerts */}
            {(emergencyAlerts || []).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-red-200 dark:border-red-800">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-3 py-2.5 text-white">
                  <p className="font-bold text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Live Alerts
                    <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">{emergencyAlerts.length}</span>
                  </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto" style={{ maxHeight: '140px' }}>
                  {emergencyAlerts.slice(0, 5).map((a, i) => (
                    <div key={a.id || i}
                      onClick={() => a.lat && a.lng && setFlyTarget([a.lat, a.lng])}
                      className={`px-3 py-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${!a.read ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{a.type || 'Alert'}</p>
                        {!a.read && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
