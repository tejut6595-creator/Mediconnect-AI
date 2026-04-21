const doctors = require("../data/doctors");

const getAllDoctors = (req, res) => {
  const { specialization, search } = req.query;
  let result = [...doctors];

  if (specialization && specialization !== "All") {
    result = result.filter(
      (d) => d.specialization.toLowerCase() === specialization.toLowerCase()
    );
  }

  if (search) {
    result = result.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({ success: true, data: result, total: result.length });
};

const getDoctorById = (req, res) => {
  const doctor = doctors.find((d) => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
  res.json({ success: true, data: doctor });
};

const getAvailability = (req, res) => {
  const doctor = doctors.find((d) => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
  res.json({
    success: true,
    available: doctor.availability,
    slots: doctor.availability ? doctor.slots : [],
    doctorName: doctor.name,
  });
};

module.exports = { getAllDoctors, getDoctorById, getAvailability };
