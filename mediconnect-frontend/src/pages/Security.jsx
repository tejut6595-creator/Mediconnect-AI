import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Key, CheckCircle, AlertTriangle, RefreshCw, Fingerprint, Server, Globe, FileText, Bell, Zap } from 'lucide-react';

const rot13 = (text) => text.split('').map(c => {
  const code = c.charCodeAt(0);
  return code >= 32 && code <= 126 ? String.fromCharCode(((code - 32 + 13) % 95) + 32) : c;
}).join('');

const genKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const Security = () => {
  const [inputText, setInputText] = useState('Patient: John Doe | Diagnosis: Hypertension | DOB: 1985-03-12');
  const [encrypted, setEncrypted] = useState('');
  const [encKey, setEncKey] = useState(genKey());
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [auditLog, setAuditLog] = useState([
    { action: 'Login',       user: 'Dr. Sarah Mitchell', time: '10:42 AM', status: 'success', ip: '192.168.1.45' },
    { action: 'View Record', user: 'Dr. James Patel',    time: '10:38 AM', status: 'success', ip: '192.168.1.67' },
    { action: 'Export Data', user: 'Admin',              time: '10:15 AM', status: 'blocked', ip: '203.0.113.42' },
    { action: 'Login Attempt',user: 'Unknown',           time: '09:55 AM', status: 'failed',  ip: '198.51.100.23' },
    { action: 'Update Profile',user: 'Patient #4821',   time: '09:30 AM', status: 'success', ip: '192.168.2.11' },
  ]);
  const [settings, setSettings] = useState({
    dataEncryption: true, twoFactor: true, auditLogging: true,
    anonymization: true, dataSharing: false, marketingEmails: false,
    locationTracking: false, biometricAuth: true,
  });

  // Live audit log simulation
  useEffect(() => {
    const actions = ['View Record', 'Login', 'Update Profile', 'Download Report', 'API Access'];
    const users   = ['Dr. Mitchell', 'Dr. Patel', 'Nurse Admin', 'Patient Portal', 'System'];
    const interval = setInterval(() => {
      setAuditLog(prev => [{
        action: actions[Math.floor(Math.random() * actions.length)],
        user:   users[Math.floor(Math.random() * users.length)],
        time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: Math.random() > 0.15 ? 'success' : 'blocked',
        ip:     `192.168.${Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 255)}`,
      }, ...prev].slice(0, 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const securityScore = Math.round((Object.values(settings).filter(Boolean).length / Object.keys(settings).length) * 100);

  const handleEncrypt = () => {
    setAnimating(true);
    setTimeout(() => { setEncrypted(rot13(inputText)); setAnimating(false); }, 700);
  };

  const privacyItems = [
    { key: 'dataEncryption',   label: '256-bit AES Encryption',    desc: 'All data encrypted at rest and in transit', icon: Lock },
    { key: 'twoFactor',        label: 'Two-Factor Authentication',  desc: 'Extra layer of login security',             icon: Fingerprint },
    { key: 'auditLogging',     label: 'Audit Logging',              desc: 'Track all data access and changes',         icon: FileText },
    { key: 'anonymization',    label: 'Data Anonymization',         desc: 'Remove PII from analytics data',            icon: Eye },
    { key: 'dataSharing',      label: 'Third-party Data Sharing',   desc: 'Share data with research partners',         icon: Globe },
    { key: 'marketingEmails',  label: 'Marketing Communications',   desc: 'Receive promotional emails',                icon: Bell },
    { key: 'locationTracking', label: 'Location Tracking',          desc: 'Track location for nearby services',        icon: Globe },
    { key: 'biometricAuth',    label: 'Biometric Authentication',   desc: 'Use fingerprint or face ID',                icon: Fingerprint },
  ];

  const complianceBadges = [
    { label: 'HIPAA Compliant', icon: Shield },
    { label: 'GDPR Ready',      icon: Globe },
    { label: 'ISO 27001',       icon: Lock },
    { label: 'SOC 2 Type II',   icon: Server },
    { label: 'End-to-End Enc.', icon: Key },
    { label: 'Zero-Knowledge',  icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-ping"
              style={{ top: `${15 + i * 14}%`, left: `${8 + i * 14}%`, animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">Security & Privacy</h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-xl mx-auto">Enterprise-grade protection for your most sensitive health data</p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {complianceBadges.map((b, i) => (
              <div key={i} className="flex items-center space-x-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                <b.icon className="w-3.5 h-3.5 text-green-400" />
                <span className="text-white text-xs font-semibold">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Score + Encryption Demo */}
          <div className="space-y-5">
            {/* Security Score */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" /><span>Security Score</span>
              </h3>
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={securityScore >= 80 ? '#10b981' : securityScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - securityScore / 100)}`}
                    className="transition-all duration-500" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">{securityScore}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <p className={`text-center text-sm font-bold ${securityScore >= 80 ? 'text-green-600' : securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {securityScore >= 80 ? '🛡️ Excellent Protection' : securityScore >= 60 ? '⚠️ Moderate Security' : '🚨 Needs Attention'}
              </p>
            </div>

            {/* Encryption Demo */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
              <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-blue-600" /><span>Live Encryption Demo</span>
                </h3>
                <p className="text-xs text-gray-400 mb-3">See how your data is protected</p>

                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Plain Text</label>
                  <textarea value={inputText} onChange={e => setInputText(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white" />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Encryption Key</label>
                    <button onClick={() => setEncKey(genKey())} className="text-blue-500 hover:text-blue-700">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">{encKey}</p>
                </div>

                <button onClick={handleEncrypt} disabled={animating}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center space-x-2 mb-3">
                  {animating
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Encrypting...</span></>
                    : <><Lock className="w-4 h-4" /><span>Encrypt Data</span></>
                  }
                </button>

                {encrypted && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3">
                      <label className="text-xs font-semibold text-red-600 block mb-1">🔒 Encrypted (What hackers see)</label>
                      <p className="text-xs font-mono text-red-700 dark:text-red-400 break-all">{encrypted}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-green-600">🔓 Decrypted (What you see)</label>
                        <button onClick={() => setShowDecrypted(!showDecrypted)}>
                          {showDecrypted ? <EyeOff className="w-3.5 h-3.5 text-green-600" /> : <Eye className="w-3.5 h-3.5 text-green-600" />}
                        </button>
                      </div>
                      <p className="text-xs font-mono text-green-700 dark:text-green-400">
                        {showDecrypted ? inputText : '••••••••••••••••••••••••••••••'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle: Privacy Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden h-fit">
            <div className="h-1.5 bg-gradient-to-r from-green-500 to-teal-500" />
            <div className="p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-600" /><span>Privacy Controls</span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">Manage how your data is used</p>
              <div className="space-y-3">
                {privacyItems.map(item => (
                  <div key={item.key} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    settings[item.key] ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${settings[item.key] ? 'bg-white dark:bg-gray-600 shadow-sm' : 'bg-gray-100 dark:bg-gray-600'}`}>
                        <item.icon className={`w-4 h-4 ${settings[item.key] ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.label}</p>
                        <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ml-2 ${settings[item.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Audit Log + Active Protections */}
          <div className="space-y-5">
            {/* Live Audit Log */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4" /><span>Live Audit Log</span>
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-300">Live</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {auditLog.map((log, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-xs animate-fade-in ${
                    log.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' :
                    log.status === 'blocked' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' :
                    'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{log.action}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                        log.status === 'success' ? 'bg-green-100 text-green-700' :
                        log.status === 'blocked' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>{log.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>{log.user}</span><span>{log.time}</span>
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 mt-0.5">IP: {log.ip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Protections */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" /><span>Active Protections</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'AES-256 Encryption',    icon: Lock },
                  { label: 'TLS 1.3 Transport',     icon: Globe },
                  { label: 'Zero-Knowledge',         icon: Eye },
                  { label: 'Biometric Auth',         icon: Fingerprint },
                  { label: 'DDoS Protection',        icon: Shield },
                  { label: 'Intrusion Detection',    icon: AlertTriangle },
                ].map((f, i) => (
                  <div key={i} className="flex items-center space-x-2 px-3 py-2.5 rounded-xl border-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <f.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">{f.label}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-auto flex-shrink-0" />
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

export default Security;
