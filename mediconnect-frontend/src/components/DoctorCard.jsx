import React from 'react';
import { Star, Clock, DollarSign, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor, compact = false }) => {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate('/appointments', { state: { doctor } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-md"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=667eea&color=fff&size=64`;
              }}
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              doctor.availability ? 'bg-green-400' : 'bg-red-400'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate">{doctor.name}</h3>
            <p className="text-blue-600 text-sm font-medium">{doctor.specialization}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">{doctor.rating}</span>
              <span className="text-xs text-gray-400">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-blue-50 rounded-xl p-2 text-center">
            <Award className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
            <p className="text-xs font-bold text-gray-800">{doctor.experience}+</p>
            <p className="text-xs text-gray-500">Years</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-2 text-center">
            <Star className="w-4 h-4 text-purple-500 mx-auto mb-0.5" />
            <p className="text-xs font-bold text-gray-800">{doctor.rating}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="bg-green-50 rounded-xl p-2 text-center">
            <DollarSign className="w-4 h-4 text-green-500 mx-auto mb-0.5" />
            <p className="text-xs font-bold text-gray-800">${doctor.fee}</p>
            <p className="text-xs text-gray-500">Fee</p>
          </div>
        </div>

        {/* Availability */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            doctor.availability
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${doctor.availability ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{doctor.availability ? 'Available Now' : 'Busy'}</span>
          </span>
          {doctor.availability && (
            <span className="text-xs text-gray-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{doctor.slots?.[0]}</span>
            </span>
          )}
        </div>

        {/* Bio */}
        {!compact && (
          <p className="mt-3 text-xs text-gray-500 line-clamp-2">{doctor.bio}</p>
        )}

        {/* Book Button */}
        <button
          onClick={handleBook}
          disabled={!doctor.availability}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            doctor.availability
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {doctor.availability ? 'Book Appointment' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
