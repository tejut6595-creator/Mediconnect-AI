import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, Thermometer, Wind, Droplets, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, RefreshCw, Zap, Moon, Clock } from 'lucide-react';

const gen = (base, v) => +(base + (Math.random() - 0.5) * v).toFixed(1);

const MiniChart = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 200},${55 - ((v - min) / range) * 45}`).join(' ');
  return (
    <svg viewBox="0 0 200 60" className="w-full h-10">
      <polyline fill={`${color}20`} stroke="none" points={`0,60 ${pts} 200,60`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
};

const VitalCard = ({ icon: Icon, label, value, unit, status, trend, color, min, max, history }) => {
  const cfg = {
    normal:   { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-400' },
    warning:  { bg: 'bg-yellow-50 dark:bg-yellow-900/20',border: 'border-yellow-200 dark:border-yellow-800', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
    critical: { bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800',      badge: 'bg-red-100 text-red-700',      dot: 'bg-red-400 animate-pulse' },
  }[status] || {};
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const chartColors = { red: '#ef4444', blue: '#3b82f6', orange: '#f97316', cyan: '#06b6d4', purple: '#8b5cf6', green: '#10b981' };
  const pct = Math.min(100, Math.max(5, ((parseFloat(value) - min) / (max - min)) * 100));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-2 ${cfg.border} hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{status}</span>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-0.5">{label}</p>
      <div className="flex items-end space-x-1 mb-2">
        <span className="text-2xl font-black text-gray-900 dark:text-white">{value}</span>
        <span className="text-gray-400 text-xs mb-0.5">{unit}</span>
        <TrendIcon className={`w-3.5 h-3.5 mb-0.5 ml-1 ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-blue-400' : 'text-gray-300'}`} />
      </div>
      {history && <MiniChart data={history} color={chartColors[color] || '#3b82f6'} />}
      <div className="mt-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${status === 'normal' ? 'bg-green-400' : status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-300 dark:text-gray-600 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
};

const profiles = {
  adult:  { name: 'Adult (18-60)',  hr: [60,100], bp: [90,140],  temp: [97,99] },
  senior: { name: 'Senior (60+)',   hr: [55,90],  bp: [95,145],  temp: [96.8,99.5] },
  child:  { name: 'Child (5-12)',   hr: [70,110], bp: [80,120],  temp: [97,99.5] },
};

const HealthMonitoring = () => {
  const [profile, setProfile] = useState('adult');
  const [vitals, setVitals] = useState({ hr: 72, bpS: 120, bpD: 80, temp: 98.6, o2: 98, rr: 16, glucose: 95, steps: 6842 });
  const [hist, setHist] = useState({
    hr:   Array.from({ length: 20 }, () => gen(72, 8)),
    o2:   Array.from({ length: 20 }, () => gen(98, 1.5)),
    temp: Array.from({ length: 20 }, () => gen(98.6, 0.3)),
  });
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef(null);

  const getStatus = (v, lo, hi) => v < lo * 0.9 || v > hi * 1.1 ? 'critical' : v < lo || v > hi ? 'warning' : 'normal';

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVitals(prev => {
        const p = profiles[profile];
        const hr   = gen(prev.hr, 4);
        const o2   = Math.min(100, gen(prev.o2, 1));
        const temp = gen(prev.temp, 0.15);
        const bpS  = gen(prev.bpS, 3);

        setHist(h => ({
          hr:   [...h.hr.slice(-19), hr],
          o2:   [...h.o2.slice(-19), o2],
          temp: [...h.temp.slice(-19), temp],
        }));

        // Alerts
        if (hr > p.hr[1] + 10 || hr < p.hr[0] - 10) {
          setAlerts(a => [{ id: Date.now(), msg: `Heart rate ${hr > p.hr[1] ? 'elevated' : 'low'}: ${hr} bpm`, sev: hr > 140 || hr < 40 ? 'critical' : 'warning', time: new Date().toLocaleTimeString() }, ...a].slice(0, 5));
        }
        if (o2 < 94) {
          setAlerts(a => [{ id: Date.now() + 1, msg: `Low oxygen saturation: ${o2}%`, sev: o2 < 90 ? 'critical' : 'warning', time: new Date().toLocaleTimeString() }, ...a].slice(0, 5));
        }

        setLastUpdate(new Date());
        return { ...prev, hr, bpS, bpD: gen(prev.bpD, 2), temp, o2, rr: gen(prev.rr, 1), glucose: gen(prev.glucose, 3), steps: prev.steps + Math.floor(Math.random() * 4) };
      });
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, [profile]);

  const p = profiles[profile];
  const cards = [
    { icon: Heart,       label: 'Heart Rate',        value: vitals.hr,                    unit: 'bpm',   status: getStatus(vitals.hr, p.hr[0], p.hr[1]),     trend: vitals.hr > 80 ? 'up' : 'stable', color: 'red',    min: 40,  max: 140, history: hist.hr },
    { icon: Activity,    label: 'Blood Pressure',     value: `${vitals.bpS}/${vitals.bpD}`,unit: 'mmHg',  status: getStatus(vitals.bpS, p.bp[0], p.bp[1]),    trend: 'stable',                         color: 'blue',   min: 80,  max: 160 },
    { icon: Thermometer, label: 'Temperature',        value: vitals.temp,                  unit: '°F',    status: getStatus(vitals.temp, p.temp[0], p.temp[1]),trend: vitals.temp > 99 ? 'up' : 'stable',color: 'orange', min: 95,  max: 104, history: hist.temp },
    { icon: Wind,        label: 'Oxygen Saturation',  value: vitals.o2,                    unit: '%',     status: getStatus(vitals.o2, 95, 100),               trend: vitals.o2 < 97 ? 'down' : 'stable',color: 'cyan',   min: 85,  max: 100, history: hist.o2 },
    { icon: Droplets,    label: 'Blood Glucose',      value: vitals.glucose,               unit: 'mg/dL', status: getStatus(vitals.glucose, 70, 140),          trend: 'stable',                         color: 'purple', min: 60,  max: 200 },
    { icon: Zap,         label: 'Respiratory Rate',   value: vitals.rr,                    unit: '/min',  status: getStatus(vitals.rr, 12, 20),                trend: 'stable',                         color: 'green',  min: 8,   max: 30 },
  ];

  const overallStatus = cards.some(c => c.status === 'critical') ? 'critical' : cards.some(c => c.status === 'warning') ? 'warning' : 'normal';
  const healthScore = overallStatus === 'normal' ? 92 : overallStatus === 'warning' ? 74 : 55;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 to-teal-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">Health Monitoring</h1>
              </div>
              <p className="text-green-200 text-sm">Real-time vitals · Live charts · Smart alerts</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
                overallStatus === 'normal' ? 'bg-green-500/20 border-green-400/30' :
                overallStatus === 'warning' ? 'bg-yellow-500/20 border-yellow-400/30' :
                'bg-red-500/20 border-red-400/30'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  overallStatus === 'normal' ? 'bg-green-400' : overallStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-white font-bold text-sm">
                  {overallStatus === 'normal' ? 'All Vitals Normal' : overallStatus === 'warning' ? 'Attention Needed' : 'Critical Alert'}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-green-200 text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
        {/* Profile + Last update */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Profile:</span>
            <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              {Object.entries(profiles).map(([k, v]) => (
                <button key={k} onClick={() => setProfile(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    profile === k ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}>{v.name}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-5 space-y-2">
            {alerts.map(a => (
              <div key={a.id} className={`flex items-center space-x-3 p-3 rounded-xl border animate-fade-in ${
                a.sev === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'
              }`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${a.sev === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{a.msg}</span>
                <span className="text-xs text-gray-400">{a.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Vitals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {cards.map((c, i) => <VitalCard key={i} {...c} />)}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Daily Steps</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{vitals.steps.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (vitals.steps / 10000) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span><span>Goal: 10,000</span>
            </div>
            <p className={`text-xs mt-2 font-semibold ${vitals.steps >= 10000 ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
              {vitals.steps >= 10000 ? '🎉 Goal reached!' : `${(10000 - vitals.steps).toLocaleString()} steps to goal`}
            </p>
          </div>

          {/* Sleep */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Night's Sleep</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">7.2 <span className="text-sm font-normal text-gray-400">hrs</span></p>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Deep Sleep', pct: 25, color: 'bg-purple-500' },
                { label: 'Light Sleep', pct: 50, color: 'bg-purple-300' },
                { label: 'REM',         pct: 20, color: 'bg-blue-400' },
                { label: 'Awake',       pct: 5,  color: 'bg-gray-200 dark:bg-gray-600' },
              ].map(s => (
                <div key={s.label} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">{s.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-7 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Health Score</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{healthScore}<span className="text-sm font-normal text-gray-400">/100</span></p>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Cardiovascular', score: Math.min(100, Math.round(100 - Math.abs(vitals.hr - 72) * 1.5)) },
                { label: 'Respiratory',    score: Math.min(100, Math.round(vitals.o2)) },
                { label: 'Metabolic',      score: Math.min(100, Math.round(100 - Math.abs(vitals.glucose - 95) * 0.5)) },
                { label: 'Activity',       score: Math.min(100, Math.floor((vitals.steps / 10000) * 100)) },
              ].map(s => (
                <div key={s.label} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">{s.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${s.score >= 80 ? 'bg-green-400' : s.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-7 text-right">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoring;
