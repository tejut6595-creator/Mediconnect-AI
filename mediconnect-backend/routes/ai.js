const express = require("express");
const router = express.Router();
const { analyzeSymptoms, checkMedicine, chat, getSymptoms, getMedicines } = require("../controllers/aiController");

router.post("/symptoms", analyzeSymptoms);
router.post("/medicine-check", checkMedicine);
router.post("/chat", chat);
router.get("/symptoms-list", getSymptoms);
router.get("/medicines-list", getMedicines);

module.exports = router;
