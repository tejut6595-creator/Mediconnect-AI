const express = require("express");
const router = express.Router();
const { getAllDoctors, getDoctorById, getAvailability } = require("../controllers/doctorController");

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.get("/availability/:id", getAvailability);

module.exports = router;
