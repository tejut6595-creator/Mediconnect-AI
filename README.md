# 🏥 MediConnect AI — Smart Healthcare Platform

> AI-powered insights + Real doctor consultation in one platform.

![MediConnect AI](https://img.shields.io/badge/MediConnect-AI-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🎯 Project Overview

MediConnect AI is a production-level healthcare platform that combines AI-powered health assistance with real-world doctor services. Built for hackathon judges to be impressed within the first 60 seconds.

---

## ✨ Features

### 🤖 AI-Powered
- **Symptom Checker** — AI analyzes symptoms and predicts conditions with severity levels
- **Medicine Safety Checker** — Verify drug safety, interactions, and dosage guidance
- **AI Chat Assistant** — 24/7 intelligent health chatbot with contextual responses

### 👨‍⚕️ Doctor Services
- **Doctor Directory** — 8+ verified specialists with real-time availability
- **Smart Filtering** — Filter by specialization, availability, search by name
- **Appointment Booking** — Full booking flow with time slot selection and confirmation

### 🛠️ Health Tools
- **BMI Calculator** — Metric & Imperial with visual BMI bar and health advice
- **Health Tips Generator** — 12 curated daily wellness tips
- **Emergency Help** — Floating button with helpline numbers popup

### 🎨 UI/UX
- Premium blue/white gradient design
- Glassmorphism + soft shadows
- Smooth animations (hover, fade, scale, slide)
- Skeleton loaders & toast notifications
- Fully responsive (mobile-first)
- Sticky navbar with scroll effects

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Data | In-memory mock data |
| ID Generation | UUID |

---

## 📁 Project Structure

```
mediconnect-ai/
├── mediconnect-frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # API client & endpoints
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Sticky responsive navbar
│   │   │   ├── Footer.jsx        # Footer with branding
│   │   │   ├── DoctorCard.jsx    # Doctor card component
│   │   │   ├── Loader.jsx        # Spinner, skeleton, AI loader
│   │   │   └── EmergencyModal.jsx # Emergency helplines popup
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page with hero, stats, features
│   │   │   ├── Doctors.jsx       # Doctor listing with filters
│   │   │   ├── Appointments.jsx  # Booking form with slot selection
│   │   │   ├── SymptomChecker.jsx # AI symptom analysis
│   │   │   ├── MedicineChecker.jsx # Drug safety checker
│   │   │   ├── Chat.jsx          # AI chat interface
│   │   │   └── Tools.jsx         # BMI calculator + health tips
│   │   ├── App.js
│   │   └── index.css             # Tailwind + custom styles
│   ├── tailwind.config.js
│   └── package.json
│
└── mediconnect-backend/
    ├── data/
    │   ├── doctors.js            # Mock doctor data (8 doctors)
    │   └── appointments.js       # In-memory appointments store
    ├── controllers/
    │   ├── doctorController.js   # Doctor CRUD logic
    │   ├── appointmentController.js # Booking logic
    │   └── aiController.js       # AI response logic
    ├── routes/
    │   ├── doctors.js
    │   ├── appointments.js
    │   └── ai.js
    └── server.js
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v16+
- npm v8+

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mediconnect-ai.git
cd mediconnect-ai
```

### 2. Start the Backend
```bash
cd mediconnect-backend
npm install
node server.js
# Server runs on http://localhost:5000
```

### 3. Start the Frontend
```bash
cd mediconnect-frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors?specialization=Cardiologist` | Filter by specialization |
| GET | `/api/doctors/:id` | Get doctor by ID |
| GET | `/api/doctors/availability/:id` | Get available slots |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | List all appointments |
| POST | `/api/symptoms` | AI symptom analysis |
| POST | `/api/medicine-check` | Medicine safety check |
| POST | `/api/chat` | AI chat response |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd mediconnect-frontend
npm run build
# Deploy /build folder to Vercel
```

### Backend → Render
```bash
# Connect GitHub repo to Render
# Set start command: node server.js
# Set environment: PORT=5000
```

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Home | Hero section with animated stats and doctor preview |
| Doctors | Grid with filters, availability badges, booking |
| Appointments | Full booking form with slot selection |
| Symptom Checker | AI analysis with severity indicators |
| Medicine Safety | Drug interaction checker |
| AI Chat | Real-time chat with typing animation |
| Health Tools | BMI calculator + health tips generator |

---

## 🎯 Demo Highlights

1. **60-second impression**: Hero section immediately communicates value
2. **Live stats**: Animated counters showing platform scale
3. **Real-time availability**: Green/red badges on doctor cards
4. **AI responses**: Contextual, human-like health guidance
5. **Smooth UX**: Every interaction has feedback (loading, success, error)
6. **Emergency access**: Always-visible emergency button

---

## 👥 Team

Built with ❤️ for Hackathon 2026

---

## 📄 License

MIT License — Free to use and modify
