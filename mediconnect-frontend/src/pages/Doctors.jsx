import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Stethoscope } from 'lucide-react';
import { doctorsAPI } from '../api/axios';
import DoctorCard from '../components/DoctorCard';
import { SkeletonCard } from '../components/Loader';
import toast from 'react-hot-toast';

const specializations = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'General Physician', 'Psychiatrist', 'Ophthalmologist'];

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    doctorsAPI.getAll()
      .then(res => {
        setDoctors(res.data.data);
        setFiltered(res.data.data);
      })
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...doctors];
    if (selectedSpec !== 'All') {
      result = result.filter(d => d.specialization === selectedSpec);
    }
    if (search) {
      result = result.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (availableOnly) {
      result = result.filter(d => d.availability);
    }
    setFiltered(result);
  }, [search, selectedSpec, availableOnly, doctors]);

  const availableCount = doctors.filter(d => d.availability).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4">
            <Stethoscope className="w-4 h-4 text-blue-300" />
            <span className="text-white/90 text-sm font-medium">Verified Specialists</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Find Your Doctor</h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Browse {doctors.length}+ verified specialists. {availableCount} available right now.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctor by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Available toggle */}
            <label className="flex items-center space-x-2 cursor-pointer px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${availableOnly ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${availableOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Available Only</span>
            </label>
          </div>

          {/* Specialization filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {specializations.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedSpec === spec
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="text-gray-600 font-medium">
            {loading ? 'Loading...' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)
            : filtered.length > 0
              ? filtered.map(doc => <DoctorCard key={doc.id} doctor={doc} />)
              : (
                <div className="col-span-full text-center py-20">
                  <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-500">No doctors found</h3>
                  <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
};

export default Doctors;
