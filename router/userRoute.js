const express = require("express");
const {
  register,
  login,
  verifikasi,
  getData,
  deleteUser,
} = require("../controller/user_controller");
const { jwtMiddle } = require("../middleware/jwtMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");
const router = express();

router.post("/register", uploadSingle, register);
router.post("/login", login);
router.post("/verifikasi/:id", verifikasi);
router.use(jwtMiddle)
router.get("/list",getData)
router.delete("/delete/:id",deleteUser)

module.exports = { userRouter: router };
