const express = require("express");
const {
  register,
  login,
  getData,
  deleteUser,
  getProfile,
  updateProfile,
} = require("../controller/user_controller");
const { jwtMiddle } = require("../middleware/jwtMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");
const router = express();

router.post("/register", uploadSingle, register);
router.post("/login", login);
router.use(jwtMiddle);
router.get("/profile", getProfile);
router.put("/update", uploadSingle,updateProfile);
router.get("/list", getData);
router.delete("/delete/:id", deleteUser);

module.exports = { userRouter: router };
