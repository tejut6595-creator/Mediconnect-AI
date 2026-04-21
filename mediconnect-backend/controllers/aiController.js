const symptomsDB = require("../data/symptoms");
const medicinesDB = require("../data/medicines");
const { v4: uuidv4 } = require("uuid");

const chatResponses = [
  { keywords: ["hello", "hi", "hey"], response: "Hello! I'm MediConnect AI. How can I help you with your health today? 😊" },
  { keywords: ["appointment", "book", "schedule"], response: "Head to our Doctors page, choose your preferred specialist, and click 'Book Appointment'. It takes less than 2 minutes! 📅" },
  { keywords: ["symptom", "sick", "pain", "hurt"], response: "Use our Symptom Checker for AI-powered analysis. For serious symptoms like chest pain or difficulty breathing, seek emergency care immediately. 🏥" },
  { keywords: ["doctor", "specialist", "physician"], response: "We have 500+ verified doctors across all specializations. Filter by specialty on our Doctors page and see real-time availability. 👨‍⚕️" },
  { keywords: ["medicine", "drug", "medication"], response: "Our Medicine Safety Checker can verify medication safety and interactions. Always consult your doctor before starting any medication. 💊" },
  { keywords: ["emergency", "urgent", "critical"], response: "🚨 For medical emergencies, call 112 immediately! Click the Emergency button for helpline numbers and SOS dispatch." },
  { keywords: ["cost", "fee", "price", "charge"], response: "Consultation fees start from $50 for General Physicians to $250 for specialists. All fees shown on doctor profiles before booking. 💰" },
  { keywords: ["covid", "corona", "virus"], response: "For COVID-19 concerns, our General Physicians can help. Symptoms include fever, cough, and loss of taste/smell. Please isolate if symptomatic. 🦠" },
  { keywords: ["bmi", "weight", "obesity"], response: "Use our BMI Calculator in Health Tools! A healthy BMI is 18.5-24.9. Our nutritionists can help with weight management plans. 📊" },
  { keywords: ["mental", "depression", "stress", "anxiety"], response: "Mental health is just as important as physical health. Our psychiatrists are here to help. Seeking help is a sign of strength. 💙" },
  { keywords: ["map", "hospital", "nearby", "location"], response: "Check our Emergency Center for a live map of nearby hospitals and ambulance tracking in real-time! 🗺️" },
  { keywords: ["record", "history", "report"], response: "Your medical history and appointment records are available in your Patient Profile page after logging in. 📋" },
];

const analyzeSymptoms = (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) return res.status(400).json({ success: false, message: "Symptoms required" });

  const symptomsLower = symptoms.toLowerCase();
  let matched = null;
  let matchedKey = null;

  for (const [key, value] of Object.entries(symptomsDB)) {
    if (symptomsLower.includes(key)) {
      matched = value;
      matchedKey = key;
      break;
    }
  }

  if (!matched) {
    matched = {
      condition: "General Health Concern",
      advice: "Your symptoms need professional evaluation. Please consult a General Physician.",
      severity: "moderate",
      specialist: "General Physician",
      treatmentCost: 60,
      medicines: ["As prescribed by doctor"],
    };
  }

  const severityMap = {
    mild: { color: "green", label: "Low Risk" },
    moderate: { color: "yellow", label: "Moderate Risk" },
    high: { color: "orange", label: "High Risk" },
    critical: { color: "red", label: "Critical — Seek Immediate Care" },
  };

  // Generate receipt
  const receiptId = `RX-${uuidv4().slice(0, 8).toUpperCase()}`;
  const consultationFee = 50;
  const medicineCost = matched.treatmentCost || 60;
  const total = consultationFee + medicineCost;

  res.json({
    success: true,
    data: {
      symptoms,
      condition: matched.condition,
      advice: matched.advice,
      severity: matched.severity,
      severityLabel: severityMap[matched.severity] || severityMap.moderate,
      recommendedSpecialist: matched.specialist,
      recommendedMedicines: matched.medicines || [],
      treatmentCost: matched.treatmentCost || 60,
      receipt: {
        id: receiptId,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        items: [
          { name: "AI Consultation Fee", amount: consultationFee },
          { name: "Estimated Medicine Cost", amount: medicineCost },
          { name: "Platform Service Fee", amount: 10 },
        ],
        subtotal: total,
        tax: Math.round(total * 0.05),
        total: Math.round(total * 1.05),
      },
      disclaimer: "This is an AI-generated analysis for informational purposes only. Always consult a qualified healthcare professional.",
      analyzedAt: new Date().toISOString(),
    },
  });
};

const checkMedicine = (req, res) => {
  const { medicines } = req.body;
  if (!medicines) return res.status(400).json({ success: false, message: "Medicine name required" });

  const medicineList = medicines.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const results = [];

  medicineList.forEach((med) => {
    const key = med.replace(/[^a-z_]/g, '');
    const found = medicinesDB[key];
    if (found) {
      results.push({ name: med, ...found });
    } else {
      results.push({
        name: med,
        safe: null,
        category: "Unknown",
        uses: "Not found in database",
        dosage: "Consult your pharmacist or doctor",
        sideEffects: "Unknown",
        interactions: [],
        price: null,
        prescription: null,
        info: "Medicine not found in our database. Please consult your pharmacist or doctor.",
      });
    }
  });

  // Check cross-interactions
  const allInteractions = [];
  results.forEach(med => {
    if (med.interactions) {
      results.forEach(other => {
        if (other.name !== med.name) {
          const hasInteraction = med.interactions.some(i =>
            i.toLowerCase().includes(other.name.toLowerCase()) ||
            other.name.toLowerCase().includes(i.toLowerCase())
          );
          if (hasInteraction) {
            allInteractions.push(`⚠️ ${med.name} + ${other.name} may interact`);
          }
        }
      });
    }
  });

  res.json({
    success: true,
    data: results,
    crossInteractions: [...new Set(allInteractions)],
    disclaimer: "Always consult a healthcare professional before taking any medication.",
  });
};

const chat = (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: "Message required" });

  const msgLower = message.toLowerCase();
  let response = null;

  for (const item of chatResponses) {
    if (item.keywords.some((kw) => msgLower.includes(kw))) {
      response = item.response;
      break;
    }
  }

  if (!response) {
    response = "That's a great question! For personalized medical advice, I recommend consulting one of our verified doctors. Is there anything specific about our services I can help you with? 🩺";
  }

  res.json({
    success: true,
    data: { message: response, timestamp: new Date().toISOString(), isAI: true },
  });
};

// Get all symptoms list
const getSymptoms = (req, res) => {
  const list = Object.entries(symptomsDB).map(([key, val]) => ({
    key,
    condition: val.condition,
    severity: val.severity,
    specialist: val.specialist,
    treatmentCost: val.treatmentCost,
  }));
  res.json({ success: true, data: list, total: list.length });
};

// Get all medicines list
const getMedicines = (req, res) => {
  const list = Object.entries(medicinesDB).map(([key, val]) => ({
    name: key,
    category: val.category,
    uses: val.uses,
    safe: val.safe,
    price: val.price,
    prescription: val.prescription,
  }));
  res.json({ success: true, data: list, total: list.length });
};

module.exports = { analyzeSymptoms, checkMedicine, chat, getSymptoms, getMedicines };
