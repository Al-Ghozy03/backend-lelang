const express = require("express");
const { updateData, penawaran, schedule, scheduleDetail, getListPenawar, history, laporan, getLaporan, getAllLaporan, generateLaporan } = require("../controller/lelang_controller");
const { jwtMiddle } = require("../middleware/jwtMiddleware");
const router = express();

router.use(jwtMiddle)
router.get("/schedule", schedule);
router.get("/report", generateLaporan);
router.get("/schedule/:id", scheduleDetail);
router.get("/list-penawaran/:id", getListPenawar);
router.put("/update/:id", updateData);
router.post("/penawaran/:id", penawaran);
router.get("/history/:id", history);

module.exports = { lelangRouter: router };
