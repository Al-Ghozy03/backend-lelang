const usermodel = require("../models").user;
const officer = require("../models").officer;
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");

async function updateProfile(req, res) {
  try {
    const data = await usermodel.findOne({
      where: { id: jwtDecode(req.headers.authorization).id },
    });
    let { name, username, password, photoProfile } = req.body;
    let url = `${req.protocol}://${req.get("host")}/${req?.file?.filename}`;
    photoProfile = url;
    if (req?.file?.filename === undefined) {
      photoProfile = data.photoProfile;
    } else {
      photoProfile = url;
    }
    if (password !== undefined) {
      password = await bcrypt.hashSync(password, 10);
    }

    await usermodel.update(
      {
        name: name,
        password: password,
        username: username,
        photoProfile: photoProfile,
      },
      { where: { id: jwtDecode(req.headers.authorization).id } }
    );
    res.json({ message: "berhasil" });
  } catch (er) {
    console.log(er);
    return res.status(442).json(er);
  }
}

async function getProfile(req, res) {
  try {
    const data = await usermodel.findOne({
      where: { id: jwtDecode(req.headers.authorization).id },
    });
    res.json({ data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

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

module.exports = {
  register,
  login,
  getData,
  deleteUser,
  getProfile,
  updateProfile,
};
