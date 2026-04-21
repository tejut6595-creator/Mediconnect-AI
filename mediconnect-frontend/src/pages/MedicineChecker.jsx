import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle, AlertTriangle, XCircle, RefreshCw, Info, DollarSign, Search, Lock, Unlock } from 'lucide-react';
import { aiAPI } from '../api/axios';
import API from '../api/axios';
import { AILoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MedicineChecker = () => {
  const { addToHistory, isAuthenticated } = useAuth();
  const [medicines, setMedicines] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/medicines-list')
      .then(r => setAllMedicines(r.data.data))
      .catch(() => {});
  }, []);

  const handleCheck = async () => {
    if (!medicines.trim()) { toast.error('Please enter medicine name(s)'); return; }
    setLoading(true); setResults(null);
    try {
      const res = await aiAPI.checkMedicine(medicines);
      setResults(res.data);
      if (isAuthenticated) {
        addToHistory({
          type: 'medicine',
          medicines: medicines.split(/[,\s]+/).filter(Boolean),
          safe: res.data.data.every(m => m.safe !== false),
        });
        toast.success('Saved to your profile!');
      }
    } catch { toast.error('Check failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const getSafetyConfig = (safe) => {
    if (safe === true)  return { Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200', label: 'Generally Safe',    badge: 'bg-green-100 text-green-700' };
    if (safe === false) return { Icon: XCircle,     color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200',   label: 'Use with Caution', badge: 'bg-red-100 text-red-700' };
    return               { Icon: Info,         color: 'text-gray-400',  bg: 'bg-gray-50 dark:bg-gray-700',      border: 'border-gray-200',  label: 'Not Found',        badge: 'bg-gray-100 text-gray-600' };
  };

  const filtered = allMedicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.uses || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">Medicine Safety Checker</h1>
          <p className="text-purple-200 text-sm sm:text-base">Full database · Safety · Dosage · Interactions · Pricing</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Checker + Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Input */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 to-blue-600" />
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Check Medicine Safety</h2>
                <input
                  type="text"
                  value={medicines}
                  onChange={e => setMedicines(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  placeholder="e.g., Aspirin, Ibuprofen, Warfarin"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:bg-gray-700 dark:text-white mb-2"
                />
                <p className="text-xs text-gray-400 mb-3">Separate multiple medicines with commas</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCheck}
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Pill className="w-4 h-4" />
                    <span>{loading ? 'Checking...' : 'Check Safety'}</span>
                  </button>
                  {(medicines || results) && (
                    <button
                      onClick={() => { setMedicines(''); setResults(null); }}
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                <AILoader message="Checking medicine safety database..." />
              </div>
            )}

            {results && !loading && (
              <div className="space-y-4 animate-slide-up">
                {/* Cross-interaction warning */}
                {results.crossInteractions?.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <p className="font-bold text-red-700 dark:text-red-400">Drug Interaction Warning!</p>
                    </div>
                    {results.crossInteractions.map((i, idx) => (
                      <p key={idx} className="text-sm text-red-600 dark:text-red-400">{i}</p>
                    ))}
                  </div>
                )}

                {results.data.map((med, i) => {
                  const { Icon, color, bg, border, label, badge } = getSafetyConfig(med.safe);
                  return (
                    <div key={i} className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-2 ${border}`}>
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-7 h-7 ${color}`} />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-gray-900 dark:text-white capitalize">{med.name}</h3>
                              <span className={`inline-block px-3 py-0.5 rounded-xl text-xs font-bold mt-1 ${badge}`}>{label}</span>
                            </div>
                          </div>
                          {med.price != null && (
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-green-600">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-2xl font-black">{med.price}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-400 justify-end mt-0.5">
                                {med.prescription ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-green-500" />}
                                <span>{med.prescription ? 'Prescription Required' : 'Over the Counter'}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          {med.category && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Category</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{med.category}</p>
                            </div>
                          )}
                          {med.uses && (
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Uses</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{med.uses}</p>
                            </div>
                          )}
                          {med.dosage && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Dosage</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{med.dosage}</p>
                            </div>
                          )}
                          {med.sideEffects && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Side Effects</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{med.sideEffects}</p>
                            </div>
                          )}
                        </div>

                        {/* Interactions */}
                        {med.interactions?.length > 0 && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <p className="text-sm font-bold text-orange-700 dark:text-orange-400">Known Interactions</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {med.interactions.map((x, j) => (
                                <span key={j} className="px-3 py-1 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded-lg">{x}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Not found info */}
                        {med.safe === null && med.info && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{med.info}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">⚠️ {results.disclaimer}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Medicine Database */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 text-white">
              <h3 className="font-bold flex items-center space-x-2 text-sm">
                <Pill className="w-4 h-4" />
                <span>Medicine Database ({allMedicines.length})</span>
              </h3>
              <p className="text-purple-200 text-xs mt-0.5">Tap any to auto-fill</p>
            </div>
            <div className="p-3">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search medicines..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-6">No medicines found</p>
                ) : (
                  filtered.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setMedicines(m.name)}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">{m.name}</span>
                        <div className="flex items-center space-x-1.5">
                          {m.price != null && (
                            <span className="text-xs font-black text-green-600">${m.price}</span>
                          )}
                          <span className={`w-2 h-2 rounded-full ${m.safe ? 'bg-green-400' : 'bg-red-400'}`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.category}</p>
                      <div className="flex items-center space-x-1 mt-0.5">
                        {m.prescription
                          ? <span className="text-xs text-orange-500 font-semibold flex items-center space-x-0.5"><Lock className="w-2.5 h-2.5" /><span>Rx</span></span>
                          : <span className="text-xs text-green-500 font-semibold flex items-center space-x-0.5"><Unlock className="w-2.5 h-2.5" /><span>OTC</span></span>
                        }
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineChecker;
