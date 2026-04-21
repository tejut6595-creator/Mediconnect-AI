const express = require("express");
const router = express.Router();

const emergencyServices = [
  { name: "National Emergency", number: "112", type: "all", available: true },
  { name: "Ambulance", number: "108", type: "medical", available: true },
  { name: "Police", number: "100", type: "police", available: true },
  { name: "Fire Brigade", number: "101", type: "fire", available: true },
  { name: "Disaster Management", number: "1078", type: "disaster", available: true },
  { name: "Women Helpline", number: "1091", type: "women", available: true },
  { name: "Poison Control", number: "1800-116-117", type: "medical", available: true },
  { name: "Mental Health", number: "iCall: 9152987821", type: "mental", available: true },
];

router.get("/services", (req, res) => {
  res.json({ success: true, data: emergencyServices });
});

router.post("/sos", (req, res) => {
  const { patientName, location, condition, lat, lng } = req.body;
  const sos = {
    id: `SOS-${Date.now()}`,
    patientName: patientName || "Unknown",
    location: location || "GPS Location",
    condition: condition || "Emergency",
    lat, lng,
    timestamp: new Date().toISOString(),
    status: "dispatched",
  };
  // Emit via socket if available
  if (req.io) req.io.emit("emergency_alert", { ...sos, severity: "critical", type: condition });
  res.json({ success: true, message: "SOS dispatched to all nearby hospitals!", data: sos });
});

module.exports = router;
