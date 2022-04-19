const admin = require("../models").officer;
const usermodel = require("../models").user;
const TokenOfficer = require("../models").token_officer;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../mail/mail");
const dotenv = require("dotenv").config();
const crypto = require("crypto");

async function addOfficer(req, res) {
  try {
    let body = req.body;
    body.password = await bcrypt.hashSync(body.password, 10);
    await admin.create(body);
    res.json({
      message: "berhasil",
    });
  } catch (er) {
    console.log(er);
  }
}

async function deleteOfficer(req, res) {
  try {
    await admin.destroy({ where: { id: req.params.id } });
  } catch (er) {}
}

async function listOfficer(req, res) {
  try {
    const data = await admin.findAndCountAll({ where: { level_id: 2 } });
    res.json({ message: "berhasil", data: data });
  } catch (er) {
    console.log(er);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await admin.findOne({
      where: { email: email },
    });
    if (!user) {
      res.status(442).json({
        message: "email salah",
      });
    } else {
      const verfiy = bcrypt.compareSync(password, user.password);

      if (verfiy) {
        if (!user.isVerified) {
          return res.status(403).json({ message: "email belum di verifikasi" });
        } else {
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.level_id == 1 ? "admin" : "officer",
            },
            process.env.JWT_SIGN,
            {
              expiresIn: "1d",
            }
          );
          res.status(200).json({
            message: "berhasil",
            token: token,
          });
        }
      } else {
        res.status(422).json({
          message: "password salah",
        });
      }
    }
  } catch (er) {}
}

async function verifikasi(req, res) {
  try {
    let { id } = req.params;
    const token = await TokenOfficer.findOne({ where: { officerId: id } });
    if (!token)
      return res.status(403).json({
        status: "gagal",
        message: "user tidak ada",
      });

    if (req.body.token !== token.token) {
      return res.status(403).json({
        status: "gagal",
        message: "token salah",
      });
    } else {
      await admin.update({ isVerified: true }, { where: { id: id } });
      res.status(200).json({
        status: "berhasil",
      });
    }
  } catch (er) {
    console.log(er);
  }
}

async function registerAdmin(req, res) {
  try {
    let body = req.body;
    body.password = await bcrypt.hashSync(body.password, 10);
    let url = `${req.protocol}://${req.get("host")}/${req?.file?.filename}`;

    if (url === "http://localhost:8000/undefined") {
      body.photoProfile = null;
    } else {
      body.photoProfile = url;
    }
    
    const userM = await usermodel.findOne({ where: { email: body.email } });
    const officerM = await admin.findOne({ where: { email: body.email } });
    if (officerM || userM) {
      return res.status(442).json({
        status: "gagal",
        message: "email telah digunakan",
      });
    }
    const user = await admin.create(body);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: body.level_id == 1 ? "admin" : "officer",
      },
      process.env.JWT_SIGN,
      {
        expiresIn: "1d",
      }
    );
    let code = crypto.randomBytes(7).toString("hex");
    const mail = await sendEmail(body.email, "Verifikasi email", code);

    if (mail === "error")
      return res.status(422).json({
        status: "gagal",
        message: "email tidak terkirim",
      });
    await TokenOfficer.create({
      officerId: user.id,
      token: code,
    });
    res.status(200).json({
      message: "berhasil",
      data: user,
      token: token,
    });
  } catch (er) {
    console.log(er);
    return res.status(442).json({
      message: "gagal",
      error: er,
    });
  }
}
module.exports = {
  registerAdmin,
  verifikasi,
  login,
  listOfficer,
  deleteOfficer,
  addOfficer,
};
