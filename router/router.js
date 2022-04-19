const express = require("express");
const { adminRouter } = require("./adminRouter");
const { barangRouter } = require("./barangRouter");
const { lelangRouter } = require("./lelangRouter");
const { userRouter } = require("./userRoute");
const router = express();

router.use("/admin", adminRouter);
router.use("/user", userRouter);
router.use("/barang", barangRouter);
router.use("/lelang", lelangRouter);
module.exports = { router };
