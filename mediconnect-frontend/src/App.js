import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmergencyModal from './components/EmergencyModal';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import SymptomChecker from './pages/SymptomChecker';
import MedicineChecker from './pages/MedicineChecker';
import Chat from './pages/Chat';
import Tools from './pages/Tools';
import Emergency from './pages/Emergency';
import HospitalDashboard from './pages/HospitalDashboard';
import HealthMonitoring from './pages/HealthMonitoring';
import Security from './pages/Security';
import LiveMap from './pages/LiveMap';
import Auth from './pages/Auth';
import PatientProfile from './pages/PatientProfile';
import { AlertTriangle, Activity } from 'lucide-react';

const AppContent = () => {
  const [showEmergency, setShowEmergency] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<PatientProfile />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/medicine-checker" element={<MedicineChecker />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        <Route path="/health-monitoring" element={<HealthMonitoring />} />
        <Route path="/security" element={<Security />} />
        <Route path="/live-map" element={<LiveMap />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-20">
            <div className="text-center">
              <div className="text-8xl font-black text-gray-200 dark:text-gray-700 mb-4">404</div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Page Not Found</h2>
              <Link to="/" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all inline-block mt-4">Go Home</Link>
            </div>
          </div>
        } />
      </Routes>
      <Footer />

      {/* Floating Emergency Button */}
      <button onClick={() => setShowEmergency(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all"
        style={{ boxShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
        <AlertTriangle className="w-5 h-5 animate-pulse" />
        <span className="text-sm">Emergency</span>
      </button>

      {/* Floating Tools Button */}
      <Link to="/tools"
        className="fixed bottom-6 left-6 z-40 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all">
        <Activity className="w-5 h-5" />
        <span className="text-sm">Health Tools</span>
      </Link>

      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}

      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { background: '#fff', color: '#374151', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', padding: '12px 16px', fontSize: '14px', fontWeight: '500' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />
    </div>
  );
};

const App = () => (
  <Router>
    <DarkModeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </DarkModeProvider>
  </Router>
);

export default App;
