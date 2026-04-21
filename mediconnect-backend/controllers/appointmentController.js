const appointments = require("../data/appointments");
const doctors = require("../data/doctors");
const { v4: uuidv4 } = require("uuid");

const bookAppointment = (req, res) => {
  const { patientName, doctorId, doctorName, date, timeSlot, reason } = req.body;

  if (!patientName || !doctorId || !date || !timeSlot) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

  if (!doctor.availability) {
    return res.status(400).json({ success: false, message: "Doctor is not available" });
  }

  const conflict = appointments.find(
    (a) => a.doctorId === doctorId && a.date === date && a.timeSlot === timeSlot
  );
  if (conflict) {
    return res.status(409).json({ success: false, message: "This slot is already booked" });
  }

  const appointment = {
    id: uuidv4(),
    patientName,
    doctorId,
    doctorName: doctorName || doctor.name,
    specialization: doctor.specialization,
    date,
    timeSlot,
    reason: reason || "General Consultation",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    fee: doctor.fee,
  };

  appointments.push(appointment);

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully!",
    data: appointment,
  });
};

const getAppointments = (req, res) => {
  res.json({ success: true, data: appointments, total: appointments.length });
};

module.exports = { bookAppointment, getAppointments };
