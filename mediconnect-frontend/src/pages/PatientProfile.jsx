import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Calendar, Droplets, Phone, Mail, Activity,
  Pill, Clock, Edit, Save, LogOut, Shield, Trash2, DollarSign, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const { user, logout, updateProfile, history, clearHistory, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '', blood: user?.blood || '' });
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 max-w-sm w-full">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Please sign in to view your health profile and history.</p>
          <Link to="/auth" className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all text-center">
            Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile(editForm);
    setEditing(false);
    toast.success('Profile updated!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const symptomHistory = history.filter(h => h.type === 'symptom');
  const medicineHistory = history.filter(h => h.type === 'medicine');
  const appointmentHistory = history.filter(h => h.type === 'appointment');
  const totalSpent = history.reduce((sum, h) => sum + (h.cost || h.fee || 0), 0);

  const handlePrintReceipt = (item) => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Receipt</title>
    <style>body{font-family:Arial,sans-serif;max-width:420px;margin:40px auto;padding:20px}
    h2{text-align:center;color:#2563eb}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #eee}
    .total{font-weight:bold;font-size:1.2em;color:#16a34a}</style></head><body>
    <h2>🏥 MediConnect AI</h2>
    <p style="text-align:center;color:#666;font-size:13px">Health Record Receipt</p>
    <p style="text-align:center;font-size:11px;color:#999">ID: ${item.receiptId || item.id} | ${new Date(item.timestamp).toLocaleString()}</p>
    <hr/>
    ${item.symptom ? `<div class="row"><span>Symptom</span><span>${item.symptom}</span></div>` : ''}
    ${item.condition ? `<div class="row"><span>Condition</span><span>${item.condition}</span></div>` : ''}
    ${item.severity ? `<div class="row"><span>Severity</span><span>${item.severity}</span></div>` : ''}
    ${item.specialist ? `<div class="row"><span>Specialist</span><span>${item.specialist}</span></div>` : ''}
    <hr/>
    <div class="row total"><span>TOTAL COST</span><span>$${item.cost || item.fee || 0}</span></div>
    <p style="text-align:center;font-size:11px;color:#999;margin-top:20px">MediConnect AI — Your Smart Healthcare Companion</p>
    </body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img src={user.avatar} alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff&size=80`; }} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
                <p className="text-blue-200 text-sm">{user.email}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === 'doctor' ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/30 text-blue-300'
                }`}>{user.role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setEditing(!editing)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors text-sm font-semibold">
                <Edit className="w-4 h-4" /><span>Edit</span>
              </button>
              <button onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/30 text-white rounded-xl hover:bg-red-500/50 transition-colors text-sm font-semibold">
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Appointments', value: appointmentHistory.length, icon: Calendar, color: 'blue' },
            { label: 'Symptoms Checked', value: symptomHistory.length, icon: Activity, color: 'purple' },
            { label: 'Medicines Checked', value: medicineHistory.length, icon: Pill, color: 'green' },
            { label: 'Total Spent', value: `$${totalSpent}`, icon: DollarSign, color: 'orange' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md text-center">
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                <s.icon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border border-gray-200 dark:border-gray-700 mb-5 overflow-x-auto">
          {[
            { id: 'overview', label: '👤 Profile' },
            { id: 'symptoms', label: `🧠 Symptoms (${symptomHistory.length})` },
            { id: 'medicines', label: `💊 Medicines (${medicineHistory.length})` },
            { id: 'appointments', label: `📅 Appointments (${appointmentHistory.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}>{tab.label}</button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Personal Information</h2>
            {editing ? (
              <div className="space-y-4 max-w-md">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">{f.label}</label>
                    <input type={f.type} value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Blood Group</label>
                  <select value={editForm.blood} onChange={e => setEditForm(p => ({ ...p, blood: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="">Select</option>
                    {bloodGroups.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" /><span>Save</span>
                  </button>
                  <button onClick={() => setEditing(false)} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Full Name', value: user.name },
                  { icon: Mail, label: 'Email', value: user.email },
                  { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
                  { icon: Calendar, label: 'Date of Birth', value: user.dob || 'Not set' },
                  { icon: Droplets, label: 'Blood Group', value: user.blood || 'Not set' },
                  { icon: Shield, label: 'Account Type', value: user.role === 'doctor' ? 'Doctor' : 'Patient' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Symptoms Tab — LIVE from history */}
        {activeTab === 'symptoms' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{symptomHistory.length} records</p>
              {symptomHistory.length > 0 && (
                <button onClick={() => { clearHistory(); toast.success('History cleared'); }}
                  className="flex items-center space-x-1 text-xs text-red-500 hover:text-red-700 font-semibold">
                  <Trash2 className="w-3.5 h-3.5" /><span>Clear All</span>
                </button>
              )}
            </div>
            {symptomHistory.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-md">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No symptom checks yet</p>
                <Link to="/symptom-checker" className="mt-3 inline-block text-sm text-blue-600 font-semibold hover:underline">Check Symptoms →</Link>
              </div>
            ) : (
              symptomHistory.map(s => (
                <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white capitalize">{s.symptom}</p>
                      <p className="text-purple-600 dark:text-purple-400 text-sm">{s.condition}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        s.severity === 'mild' ? 'bg-green-100 text-green-700' :
                        s.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        s.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>{s.severity}</span>
                      <span className="text-green-600 font-black text-sm">${s.cost}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-gray-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" /><span>{new Date(s.timestamp).toLocaleString()}</span>
                    </p>
                    <button onClick={() => handlePrintReceipt(s)}
                      className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                      <Printer className="w-3.5 h-3.5" /><span>Print Receipt</span>
                    </button>
                  </div>
                  {s.medicines?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.medicines.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded-lg">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Medicines Tab */}
        {activeTab === 'medicines' && (
          <div className="space-y-3">
            {medicineHistory.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-md">
                <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No medicine checks yet</p>
                <Link to="/medicine-checker" className="mt-3 inline-block text-sm text-blue-600 font-semibold hover:underline">Check Medicines →</Link>
              </div>
            ) : (
              medicineHistory.map(m => (
                <div key={m.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Medicine Check</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(m.medicines || []).map((med, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-lg font-semibold">{med}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${m.safe !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {m.safe !== false ? '✓ Safe' : '⚠ Caution'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" /><span>{new Date(m.timestamp).toLocaleString()}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {appointmentHistory.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-md">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments yet</p>
                <Link to="/appointments" className="mt-3 inline-block text-sm text-blue-600 font-semibold hover:underline">Book Appointment →</Link>
              </div>
            ) : (
              appointmentHistory.map(apt => (
                <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{apt.doctorName || 'Doctor'}</p>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">{apt.specialization}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">{apt.status || 'confirmed'}</span>
                      <p className="text-green-600 font-black text-sm mt-1">${apt.fee || apt.cost || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-400 flex-wrap gap-1">
                    <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{apt.date}</span></span>
                    <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{apt.timeSlot}</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
