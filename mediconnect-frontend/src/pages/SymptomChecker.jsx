import React, { useState, useEffect } from 'react';
import { Brain, Stethoscope, ArrowRight, RefreshCw, DollarSign, Pill, Printer } from 'lucide-react';
import { aiAPI } from '../api/axios';
import API from '../api/axios';
import { AILoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SEV = {
  mild:     { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200',  text: 'text-green-700 dark:text-green-400',  badge: 'bg-green-100 text-green-700' },
  moderate: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',border: 'border-yellow-200', text: 'text-yellow-700 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  high:     { bg: 'bg-orange-50 dark:bg-orange-900/20',border: 'border-orange-200', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700' },
  critical: { bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200',    text: 'text-red-700 dark:text-red-400',      badge: 'bg-red-100 text-red-700' },
};

const SymptomChecker = () => {
  const { addToHistory, isAuthenticated } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    API.get('/symptoms-list').then(r => setAllSymptoms(r.data.data)).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) { toast.error('Please enter your symptoms'); return; }
    setLoading(true); setResult(null); setShowReceipt(false);
    try {
      const res = await aiAPI.analyzeSymptoms(symptoms);
      const data = res.data.data;
      setResult(data);
      if (isAuthenticated) {
        addToHistory({
          type: 'symptom',
          symptom: symptoms,
          condition: data.condition,
          severity: data.severity,
          cost: data.receipt?.total || 0,
          receiptId: data.receipt?.id,
          specialist: data.recommendedSpecialist,
          medicines: data.recommendedMedicines,
        });
        toast.success('Saved to your health profile!');
      }
    } catch { toast.error('Analysis failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Receipt</title>
    <style>body{font-family:Arial,sans-serif;max-width:420px;margin:40px auto;padding:20px}
    h2{text-align:center;color:#2563eb}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #eee}
    .total{font-weight:bold;font-size:1.2em;color:#16a34a}</style></head><body>
    <h2>🏥 MediConnect AI</h2>
    <p style="text-align:center;color:#666;font-size:13px">Medical Consultation Receipt</p>
    <p style="text-align:center;font-size:11px;color:#999">ID: ${result?.receipt?.id} | ${result?.receipt?.date} ${result?.receipt?.time}</p>
    <hr/>
    <div class="row"><span>Symptoms</span><span>${symptoms}</span></div>
    <div class="row"><span>Condition</span><span>${result?.condition}</span></div>
    <div class="row"><span>Severity</span><span>${result?.severity}</span></div>
    <div class="row"><span>Specialist</span><span>${result?.recommendedSpecialist}</span></div>
    <hr/>
    ${result?.receipt?.items?.map(i => `<div class="row"><span>${i.name}</span><span>$${i.amount}</span></div>`).join('')}
    <div class="row"><span>Tax (5%)</span><span>$${result?.receipt?.tax}</span></div>
    <div class="row total"><span>TOTAL</span><span>$${result?.receipt?.total}</span></div>
    <p style="text-align:center;font-size:11px;color:#999;margin-top:20px">AI-generated estimate. Consult a doctor for actual treatment.</p>
    </body></html>`);
    w.document.close(); w.print();
  };

  const displayed = showAll ? allSymptoms : allSymptoms.slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">AI Symptom Checker</h1>
          <p className="text-blue-200 text-sm sm:text-base">AI analysis + treatment cost + printable receipt</p>
          {!isAuthenticated && (
            <p className="mt-2 text-yellow-300 text-xs">
              <Link to="/auth" className="underline font-semibold">Sign in</Link> to save results to your health profile
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Input + Result */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Describe Your Symptoms</h2>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                  placeholder="e.g., I have fever, headache and body aches for 2 days..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm dark:bg-gray-700 dark:text-white mb-3" />
                <div className="flex gap-2">
                  <button onClick={handleAnalyze} disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center space-x-2 text-sm">
                    <Brain className="w-4 h-4" />
                    <span>{loading ? 'Analyzing...' : 'Analyze Symptoms'}</span>
                  </button>
                  {(symptoms || result) && (
                    <button onClick={() => { setSymptoms(''); setResult(null); setShowReceipt(false); }}
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-200 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                <AILoader message="Analyzing your health condition with AI..." />
              </div>
            )}

            {result && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-2 animate-slide-up" style={{ borderColor: result.severity === 'critical' ? '#fca5a5' : result.severity === 'high' ? '#fdba74' : result.severity === 'moderate' ? '#fde047' : '#86efac' }}>
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Analysis Result</h3>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${SEV[result.severity]?.badge || 'bg-gray-100 text-gray-700'}`}>
                      {result.severityLabel?.label}
                    </span>
                  </div>

                  <div className={`p-4 ${SEV[result.severity]?.bg} rounded-2xl mb-3`}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Possible Condition</p>
                    <p className={`text-lg font-black ${SEV[result.severity]?.text}`}>{result.condition}</p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recommended Action</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{result.advice}</p>
                  </div>

                  {result.recommendedMedicines?.length > 0 && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="w-4 h-4 text-purple-600" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recommended Medicines</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.recommendedMedicines.map((med, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-xl">{med}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cost */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl mb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Total Cost</p>
                          <p className="text-2xl font-black text-green-700 dark:text-green-400">${result.receipt?.total}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowReceipt(!showReceipt)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors">
                        <Printer className="w-4 h-4" />
                        <span>{showReceipt ? 'Hide' : 'View'} Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* Receipt */}
                  {showReceipt && result.receipt && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-5 mb-3 animate-fade-in">
                      <div className="text-center mb-4">
                        <p className="text-base font-black text-gray-900 dark:text-white">🏥 MediConnect AI</p>
                        <p className="text-xs text-gray-500">Medical Consultation Receipt</p>
                        <p className="text-xs text-blue-600 font-mono mt-1">{result.receipt.id}</p>
                        <p className="text-xs text-gray-400">{result.receipt.date} • {result.receipt.time}</p>
                      </div>
                      <div className="space-y-2 border-t border-dashed border-gray-300 dark:border-gray-600 pt-3">
                        {result.receipt.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">${item.amount}</span>
                          </div>
                        ))}
                        <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-2 space-y-1">
                          <div className="flex justify-between text-sm text-gray-500"><span>Tax (5%)</span><span>${result.receipt.tax}</span></div>
                          <div className="flex justify-between font-black text-base pt-1 border-t border-gray-300 dark:border-gray-600">
                            <span className="text-gray-900 dark:text-white">TOTAL</span>
                            <span className="text-green-600">${result.receipt.total}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={handlePrint}
                        className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm">
                        <Printer className="w-4 h-4" /><span>Print Receipt</span>
                      </button>
                    </div>
                  )}

                  {/* Specialist */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex-wrap gap-2">
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Recommended Specialist</p>
                        <p className="font-bold text-blue-700 dark:text-blue-400">{result.recommendedSpecialist}</p>
                      </div>
                    </div>
                    <Link to="/doctors" className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                      <span>Find Doctor</span><ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">⚠️ {result.disclaimer}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Symptoms list */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <h3 className="font-bold flex items-center space-x-2 text-sm">
                <Brain className="w-4 h-4" />
                <span>All Symptoms ({allSymptoms.length})</span>
              </h3>
              <p className="text-blue-200 text-xs mt-0.5">Tap any to auto-fill</p>
            </div>
            <div className="p-3 space-y-1.5 max-h-[500px] overflow-y-auto">
              {displayed.map((s, i) => (
                <button key={i} onClick={() => setSymptoms(s.key)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">{s.key}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      s.severity === 'mild' ? 'bg-green-100 text-green-700' :
                      s.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      s.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>{s.severity}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{s.condition}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-0.5">Est. ${s.treatmentCost}</p>
                </button>
              ))}
              {allSymptoms.length > 12 && (
                <button onClick={() => setShowAll(!showAll)}
                  className="w-full py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                  {showAll ? 'Show Less ▲' : `Show All ${allSymptoms.length} ▼`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
