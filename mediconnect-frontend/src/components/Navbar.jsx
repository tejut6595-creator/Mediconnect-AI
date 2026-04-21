import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity, Bell, AlertTriangle, Clock, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const location = useLocation();
  const { connected, emergencyAlerts, unreadCount, markAlertRead } = useSocket();
  const { user, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const alertRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (alertRef.current && !alertRef.current.contains(e.target)) setShowAlerts(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/doctors', label: 'Doctors' },
    { path: '/appointments', label: 'Book' },
    { path: '/symptom-checker', label: 'Symptoms' },
    { path: '/medicine-checker', label: 'Medicine' },
    { path: '/chat', label: 'AI Chat' },
    { path: '/live-map', label: '🗺️ Map' },
    { path: '/emergency', label: '🚨 SOS', emergency: true },
    { path: '/hospital-dashboard', label: '🏥 Dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
        : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MediConnect AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-0.5">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  link.emergency
                    ? isActive(link.path) ? 'bg-red-100 text-red-600 font-bold' : 'text-red-500 hover:bg-red-50 font-semibold'
                    : isActive(link.path)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1.5">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{connected ? 'Live' : 'Offline'}</span>
            </div>

            {/* Dark mode toggle */}
            <button onClick={toggle}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>

            {/* Alert Bell */}
            <div className="relative" ref={alertRef}>
              <button onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showAlerts && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4" /><span className="font-bold text-sm">Live Alerts</span></div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{emergencyAlerts.length}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {emergencyAlerts.length === 0
                      ? <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">No active alerts</div>
                      : emergencyAlerts.slice(0, 8).map((alert) => (
                        <div key={alert.id} onClick={() => markAlertRead(alert.id)}
                          className={`p-3 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!alert.read ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {!alert.read && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0 mt-1" />}
                              <div>
                                <p className="font-semibold text-xs text-gray-800 dark:text-gray-200">{alert.type || 'Emergency Alert'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1 mt-0.5">
                                  <Clock className="w-3 h-3" /><span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>{alert.severity}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                    <Link to="/emergency" onClick={() => setShowAlerts(false)} className="block text-center text-xs font-bold text-red-600 hover:text-red-700">View Emergency Center →</Link>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setShowUser(!showUser)}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <img src={user.avatar} alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff&size=28`; }} />
                  <span className="hidden sm:block text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-20 truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {showUser && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setShowUser(false)}
                      className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4" /><span>My Profile</span>
                    </Link>
                    <button onClick={() => { logout(); setShowUser(false); }}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600">
                      <LogOut className="w-4 h-4" /><span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth"
                className="hidden sm:block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setIsOpen(!isOpen)} className="xl:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="xl:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  link.emergency ? 'text-red-600 bg-red-50 dark:bg-red-900/20 font-semibold' :
                  isActive(link.path) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' :
                  'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'
                }`}>{link.label}</Link>
            ))}
            {!user
              ? <Link to="/auth" onClick={() => setIsOpen(false)} className="block mt-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl text-center">Sign In / Register</Link>
              : <button onClick={() => { logout(); setIsOpen(false); }} className="w-full mt-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-semibold rounded-xl text-center">Logout</button>
            }
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
