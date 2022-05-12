const express = require("express");
const { updateData, penawaran, schedule, scheduleDetail, history, generateLaporan } = require("../controller/lelang_controller");
const { jwtMiddle } = require("../middleware/jwtMiddleware");
const router = express();

router.use(jwtMiddle)
router.get("/schedule", schedule);
router.get("/report", generateLaporan);
router.get("/schedule/:id", scheduleDetail);
router.put("/update/:id", updateData);
router.post("/penawaran/:id", penawaran);
router.get("/history/:id", history);

module.exports = { lelangRouter: router };
