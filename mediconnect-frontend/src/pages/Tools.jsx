import React, { useState } from 'react';
import { Activity, Lightbulb, RefreshCw, Calculator } from 'lucide-react';

const healthTips = [
  "💧 Drink at least 8 glasses of water daily to stay hydrated and support kidney function.",
  "🚶 Walk 10,000 steps a day to reduce risk of heart disease by up to 30%.",
  "😴 Adults need 7-9 hours of quality sleep for optimal brain and body function.",
  "🥦 Eat 5 servings of fruits and vegetables daily for essential vitamins and minerals.",
  "🧘 Practice 10 minutes of mindfulness or meditation daily to reduce stress hormones.",
  "🏃 30 minutes of moderate exercise 5 days a week significantly improves cardiovascular health.",
  "🚭 Quitting smoking reduces heart disease risk by 50% within just one year.",
  "🌞 Get 15-20 minutes of sunlight daily for natural Vitamin D synthesis.",
  "🦷 Brush and floss twice daily — poor oral health is linked to heart disease.",
  "📵 Limit screen time before bed; blue light disrupts melatonin and sleep quality.",
  "🥗 Reduce processed food intake; opt for whole grains, lean proteins, and healthy fats.",
  "🤸 Stretch for 5-10 minutes every morning to improve flexibility and reduce injury risk.",
];

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50', advice: 'Consider increasing caloric intake with nutrient-dense foods. Consult a nutritionist.' };
  if (bmi < 25) return { label: 'Normal Weight', color: 'text-green-600', bg: 'bg-green-50', advice: 'Great! Maintain your healthy lifestyle with balanced diet and regular exercise.' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50', advice: 'Consider increasing physical activity and reducing caloric intake. Consult a doctor.' };
  return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50', advice: 'Please consult a healthcare provider for a personalized weight management plan.' };
};

const Tools = () => {
  const [bmiForm, setBmiForm] = useState({ weight: '', height: '', unit: 'metric' });
  const [bmiResult, setBmiResult] = useState(null);
  const [currentTip, setCurrentTip] = useState(healthTips[0]);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipAnimating, setTipAnimating] = useState(false);

  const calculateBMI = () => {
    const { weight, height, unit } = bmiForm;
    if (!weight || !height) return;

    let bmi;
    if (unit === 'metric') {
      const heightM = parseFloat(height) / 100;
      bmi = parseFloat(weight) / (heightM * heightM);
    } else {
      bmi = (703 * parseFloat(weight)) / (parseFloat(height) * parseFloat(height));
    }

    setBmiResult(bmi.toFixed(1));
  };

  const nextTip = () => {
    setTipAnimating(true);
    setTimeout(() => {
      const next = (tipIndex + 1) % healthTips.length;
      setTipIndex(next);
      setCurrentTip(healthTips[next]);
      setTipAnimating(false);
    }, 300);
  };

  const randomTip = () => {
    setTipAnimating(true);
    setTimeout(() => {
      const random = Math.floor(Math.random() * healthTips.length);
      setTipIndex(random);
      setCurrentTip(healthTips[random]);
      setTipAnimating(false);
    }, 300);
  };

  const bmiCategory = bmiResult ? getBMICategory(parseFloat(bmiResult)) : null;

  const getBMIBarWidth = (bmi) => {
    const clamped = Math.min(Math.max(parseFloat(bmi), 10), 40);
    return ((clamped - 10) / 30) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 to-blue-900 py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Health Tools</h1>
          <p className="text-green-200 text-lg max-w-xl mx-auto">Smart tools to monitor and improve your health</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BMI Calculator */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500" />
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                  <Calculator className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">BMI Calculator</h2>
                  <p className="text-gray-500 text-sm">Body Mass Index</p>
                </div>
              </div>

              {/* Unit toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                {['metric', 'imperial'].map(u => (
                  <button
                    key={u}
                    onClick={() => { setBmiForm(prev => ({ ...prev, unit: u })); setBmiResult(null); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                      bmiForm.unit === u ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {u} {u === 'metric' ? '(kg/cm)' : '(lbs/in)'}
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Weight ({bmiForm.unit === 'metric' ? 'kg' : 'lbs'})
                  </label>
                  <input
                    type="number"
                    value={bmiForm.weight}
                    onChange={e => setBmiForm(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder={bmiForm.unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Height ({bmiForm.unit === 'metric' ? 'cm' : 'inches'})
                  </label>
                  <input
                    type="number"
                    value={bmiForm.height}
                    onChange={e => setBmiForm(prev => ({ ...prev, height: e.target.value }))}
                    placeholder={bmiForm.unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={calculateBMI}
                disabled={!bmiForm.weight || !bmiForm.height}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Activity className="w-5 h-5" />
                <span>Calculate BMI</span>
              </button>

              {/* Result */}
              {bmiResult && bmiCategory && (
                <div className={`mt-5 p-5 ${bmiCategory.bg} rounded-2xl animate-slide-up`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Your BMI</p>
                      <p className={`text-4xl font-black ${bmiCategory.color}`}>{bmiResult}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${bmiCategory.color} bg-white shadow-sm`}>
                      {bmiCategory.label}
                    </span>
                  </div>

                  {/* BMI bar */}
                  <div className="mb-3">
                    <div className="h-3 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 rounded-full relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md transition-all"
                        style={{ left: `${getBMIBarWidth(bmiResult)}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{bmiCategory.advice}</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Tips Generator */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Health Tips</h2>
                  <p className="text-gray-500 text-sm">Daily wellness insights</p>
                </div>
              </div>

              {/* Tip display */}
              <div className={`p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 mb-5 min-h-32 flex items-center transition-opacity duration-300 ${tipAnimating ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-gray-700 text-base leading-relaxed font-medium">{currentTip}</p>
              </div>

              {/* Tip counter */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-400">Tip {tipIndex + 1} of {healthTips.length}</p>
                <div className="flex space-x-1">
                  {healthTips.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${i === tipIndex ? 'w-6 bg-yellow-500' : 'w-1.5 bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={nextTip}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span>Next Tip</span>
                </button>
                <button
                  onClick={randomTip}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors"
                  title="Random tip"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* All tips preview */}
              <div className="mt-5 space-y-2 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Tips</p>
                {healthTips.map((tip, i) => (
                  <button
                    key={i}
                    onClick={() => { setTipIndex(i); setCurrentTip(tip); }}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all ${
                      i === tipIndex ? 'bg-yellow-50 border border-yellow-200 text-gray-800' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tip.slice(0, 60)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
