import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Clock, User, Stethoscope, CheckCircle, ChevronDown } from 'lucide-react';
import { doctorsAPI, appointmentsAPI } from '../api/axios';
import { AILoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Appointments = () => {
  const location = useLocation();
  const preselectedDoctor = location.state?.doctor;

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || null);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    patientName: '',
    doctorId: preselectedDoctor?.id || '',
    date: '',
    timeSlot: '',
    reason: '',
  });
  const { addToHistory, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    doctorsAPI.getAll().then(res => setDoctors(res.data.data));
  }, []);

  useEffect(() => {
    if (form.doctorId) {
      setSlotsLoading(true);
      doctorsAPI.getAvailability(form.doctorId)
        .then(res => {
          setSlots(res.data.slots || []);
          const doc = doctors.find(d => d.id === form.doctorId);
          setSelectedDoctor(doc || null);
        })
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [form.doctorId, doctors]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value, ...(e.target.name === 'doctorId' ? { timeSlot: '' } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.doctorId || !form.date || !form.timeSlot) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await appointmentsAPI.book({
        ...form,
        doctorName: selectedDoctor?.name,
      });
      setSuccess(res.data.data);
      if (isAuthenticated) {
        addToHistory({
          type: 'appointment',
          doctorName: res.data.data.doctorName,
          specialization: res.data.data.specialization,
          date: res.data.data.date,
          timeSlot: res.data.data.timeSlot,
          fee: res.data.data.fee,
          status: 'confirmed',
        });
      }
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setForm({ patientName: '', doctorId: '', date: '', timeSlot: '', reason: '' });
    setSelectedDoctor(null);
    setSlots([]);
  };

  const today = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-500 mb-6">Your appointment has been successfully booked.</p>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Patient</p>
                <p className="font-semibold text-gray-800">{success.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Stethoscope className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">Doctor</p>
                <p className="font-semibold text-gray-800">{success.doctorName}</p>
                <p className="text-xs text-gray-400">{success.specialization}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-800">{success.date} at {success.timeSlot}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-yellow-100 rounded flex items-center justify-center">
                <span className="text-xs">$</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Consultation Fee</p>
                <p className="font-semibold text-gray-800">${success.fee}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 mb-6">
            <p className="text-xs text-blue-600 font-medium">Booking ID: {success.id?.slice(0, 8).toUpperCase()}</p>
          </div>

          <button
            onClick={resetForm}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Book Appointment</h1>
          <p className="text-blue-200 text-lg">Schedule your consultation with top specialists</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600" />
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Details</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="patientName"
                    value={form.patientName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Doctor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    required
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id} disabled={!doc.availability}>
                        {doc.name} — {doc.specialization} {!doc.availability ? '(Busy)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Selected Doctor Info */}
              {selectedDoctor && (
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-fade-in">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=667eea&color=fff`; }}
                  />
                  <div>
                    <p className="font-bold text-gray-900">{selectedDoctor.name}</p>
                    <p className="text-blue-600 text-sm">{selectedDoctor.specialization}</p>
                    <p className="text-gray-500 text-xs">Fee: ${selectedDoctor.fee} • Rating: ⭐ {selectedDoctor.rating}</p>
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={today}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Slot <span className="text-red-500">*</span>
                </label>
                {slotsLoading ? (
                  <AILoader message="Loading available slots..." />
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, timeSlot: slot }))}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                          form.timeSlot === slot
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : form.doctorId ? (
                  <p className="text-gray-400 text-sm py-3">No slots available for this doctor</p>
                ) : (
                  <p className="text-gray-400 text-sm py-3">Select a doctor to see available slots</p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit</label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Briefly describe your symptoms or reason for visit..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Booking...</span>
                  </span>
                ) : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
