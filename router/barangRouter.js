const express = require("express");
const {
  postBarang,
  getAll,
  searchBarang,
  detail,
  updateBarang,
  deleteBarang,
  today,
  getByCategories,
  generateReport,
  getNol,
  getOther,
} = require("../controller/barang_controller");
const { jwtMiddle } = require("../middleware/jwtMiddleware");
const { postFotoBarang } = require("../middleware/barangUpload");
const router = express();

router.use(jwtMiddle);
router.post("/post", postFotoBarang, postBarang);
router.get("/all", getAll);
router.get("/other",getOther)
router.get("/nol", getNol);
router.get("/search", searchBarang);
router.get("/today", today);
router.get("/detail/:id", detail);
router.get("/category", getByCategories);
router.put("/update/:id", postFotoBarang, updateBarang);
router.delete("/delete/:id", deleteBarang);

module.exports = { barangRouter: router };
