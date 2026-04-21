const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
      "https://mediconnect-ai.vercel.app",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "https://mediconnect-ai.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());

// Attach io to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api", require("./routes/ai"));
app.use("/api/emergency", require("./routes/emergency"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "MediConnect AI Backend is running 🏥", version: "2.0.0" });
});

// ─── Socket.io Real-Time Engine ───────────────────────────────────────────────
const connectedHospitals = new Map();
const activeEmergencies = new Map();
const ambulances = new Map();

// Simulate live ambulance positions
const hospitalLocations = [
  { id: "H1", name: "City General Hospital", lat: 12.9716, lng: 77.5946, beds: 45, doctors: 12, status: "active" },
  { id: "H2", name: "Apollo Medical Center", lat: 12.9352, lng: 77.6245, beds: 23, doctors: 8, status: "active" },
  { id: "H3", name: "Fortis Healthcare", lat: 12.9279, lng: 77.6271, beds: 67, doctors: 15, status: "active" },
  { id: "H4", name: "Manipal Hospital", lat: 12.9592, lng: 77.6974, beds: 12, doctors: 6, status: "busy" },
  { id: "H5", name: "St. John's Medical", lat: 12.9250, lng: 77.6200, beds: 34, doctors: 10, status: "active" },
];

// Simulate live ambulance data
let ambulanceData = [
  { id: "AMB-001", lat: 12.9716, lng: 77.5946, status: "available", hospital: "H1", speed: 0 },
  { id: "AMB-002", lat: 12.9352, lng: 77.6245, status: "en-route", hospital: "H2", speed: 65 },
  { id: "AMB-003", lat: 12.9279, lng: 77.6271, status: "available", hospital: "H3", speed: 0 },
  { id: "AMB-004", lat: 12.9592, lng: 77.6974, status: "at-scene", hospital: "H4", speed: 0 },
];

// Simulate ambulance movement
setInterval(() => {
  ambulanceData = ambulanceData.map(amb => {
    if (amb.status === "en-route") {
      return {
        ...amb,
        lat: amb.lat + (Math.random() - 0.5) * 0.002,
        lng: amb.lng + (Math.random() - 0.5) * 0.002,
        speed: Math.floor(40 + Math.random() * 40),
      };
    }
    return amb;
  });
  io.emit("ambulance_update", ambulanceData);
}, 3000);

// Simulate random emergency alerts
setInterval(() => {
  if (Math.random() > 0.7) {
    const types = ["Cardiac Arrest", "Road Accident", "Stroke", "Severe Trauma", "Respiratory Failure"];
    const severities = ["critical", "high", "moderate"];
    const alert = {
      id: `EMG-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      lat: 12.9716 + (Math.random() - 0.5) * 0.05,
      lng: 77.5946 + (Math.random() - 0.5) * 0.05,
      location: "Auto-detected via GPS",
      timestamp: new Date().toISOString(),
      patientAge: Math.floor(20 + Math.random() * 60),
      respondingUnit: `AMB-00${Math.floor(1 + Math.random() * 4)}`,
    };
    io.emit("emergency_alert", alert);
  }
}, 8000);

// Simulate hospital stats updates
setInterval(() => {
  const updatedHospitals = hospitalLocations.map(h => ({
    ...h,
    beds: Math.max(0, h.beds + Math.floor((Math.random() - 0.5) * 4)),
    doctors: Math.max(1, h.doctors + Math.floor((Math.random() - 0.5) * 2)),
    waitTime: Math.floor(5 + Math.random() * 45),
    occupancy: Math.floor(40 + Math.random() * 55),
  }));
  io.emit("hospital_update", updatedHospitals);
}, 5000);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send initial data
  socket.emit("initial_data", {
    hospitals: hospitalLocations,
    ambulances: ambulanceData,
    activeEmergencies: Array.from(activeEmergencies.values()),
  });

  // Hospital dashboard registration
  socket.on("register_hospital", (data) => {
    connectedHospitals.set(socket.id, { ...data, socketId: socket.id });
    io.emit("hospital_online", { hospitalId: data.id, name: data.name });
    console.log(`🏥 Hospital registered: ${data.name}`);
  });

  // Patient SOS trigger
  socket.on("patient_sos", (data) => {
    const emergency = {
      id: `SOS-${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      status: "active",
      respondingHospitals: [],
    };
    activeEmergencies.set(emergency.id, emergency);
    // Broadcast to ALL connected clients (hospitals, dashboards)
    io.emit("emergency_alert", emergency);
    io.emit("sos_received", emergency);
    console.log(`🚨 SOS received from patient: ${JSON.stringify(data)}`);
  });

  // Accident report
  socket.on("report_accident", (data) => {
    const report = {
      id: `ACC-${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      status: "reported",
    };
    activeEmergencies.set(report.id, report);
    io.emit("accident_reported", report);
    io.emit("emergency_alert", { ...report, type: "Road Accident", severity: "high" });
    console.log(`🚗 Accident reported: ${JSON.stringify(data)}`);
  });

  // Hospital accepts emergency
  socket.on("accept_emergency", (data) => {
    const emg = activeEmergencies.get(data.emergencyId);
    if (emg) {
      emg.status = "responding";
      emg.respondingHospital = data.hospitalName;
      activeEmergencies.set(data.emergencyId, emg);
      io.emit("emergency_accepted", { emergencyId: data.emergencyId, hospital: data.hospitalName });
    }
  });

  socket.on("disconnect", () => {
    connectedHospitals.delete(socket.id);
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Expose hospitals data via REST too
app.get("/api/hospitals", (req, res) => {
  res.json({ success: true, data: hospitalLocations });
});

app.get("/api/emergencies", (req, res) => {
  res.json({ success: true, data: Array.from(activeEmergencies.values()) });
});

server.listen(PORT, () => {
  console.log(`✅ MediConnect AI Server v2.0 running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io real-time engine active`);
});
