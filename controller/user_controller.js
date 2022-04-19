const usermodel = require("../models").user;
const officer = require("../models").officer;
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../mail/mail");
const tokenUser = require("../models").token_user;

async function deleteUser(req, res) {
  try {
    await usermodel.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "berhasil menghapus" });
  } catch (er) {
    return res.status(442).json({ message: "gagal", error: er });
  }
}

async function getData(req, res) {
  try {
    const data = await usermodel.findAndCountAll();
    res.status(200).json({
      message: "berhasil",
      data: data,
    });
  } catch (er) {
    console.log(er);
    return res.status(442).json({
      message: "gagal",
      error: er,
    });
  }
}

async function verifikasi(req, res) {
  try {
    let { id } = req.params;
    const token = await tokenUser.findOne({ where: { userId: id } });
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
      await usermodel.update({ isVerified: true }, { where: { id: id } });
      res.status(200).json({
        status: "berhasil",
      });
    }
  } catch (er) {}
}
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await usermodel.findOne({
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
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              role: "user",
            },
            process.env.JWT_SIGN,
            {
              expiresIn: "1d",
            }
          );
          return res
            .status(401)
            .json({ message: "email belum diverifikasi", token: token });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: "user",
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
      } else {
        res.status(422).json({
          message: "password salah",
        });
      }
    }
  } catch (er) {
    console.log(er);
  }
}

async function register(req, res) {
  try {
    let body = req.body;
    body.password = await bcrypt.hashSync(body.password, 10);
    if (body.photoProfile === undefined) {
      body.photoProfile = null;
    } else {
      let url = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
      body.photoProfile = url;
    }
    const userM = await usermodel.findOne({ where: { email: body.email } });
    const officerM = await officer.findOne({ where: { email: body.email } });

    if (officerM || userM)
      return res.status(442).json({
        status: "gagal",
        message: "email telah digunakan",
      });

    const user = await usermodel.create(body);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "user",
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

    await tokenUser.create({
      userId: user.id,
      token: code,
    });
    res.json({
      status: "berhasil",
      data: user,
      token: token,
    });
  } catch (er) {
    console.log(er);
    return res.status(442).json({
      status: "gagal",
      error: er,
    });
  }
}

module.exports = { register, login, verifikasi, getData,deleteUser };
