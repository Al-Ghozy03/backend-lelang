const admin = require("../models").officer;
const usermodel = require("../models").user;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const levelmodel = require("../models").level;

async function createLevel(req, res) {
  try {
    const data = await levelmodel.bulkCreate([{ level: 1 }, { level: 2 }]);
    res.json({ message: "berhasil", data });
  } catch (er) {
    return res.status(442).json(er);
  }
}

async function addOfficer(req, res) {
  try {
    let body = req.body;
    body.password = await bcrypt.hashSync(body.password, 10);
    const userM = await usermodel.findOne({ where: { email: body.email } });
    const officerM = await admin.findOne({ where: { email: body.email } });
    if (officerM || userM) {
      return res.status(442).json({
        status: "gagal",
        message: "email telah digunakan",
      });
    }
    await admin.create({
      name: body.name,
      email: body.email,
      username: body.username,
      password: body.password,
      level_id: 2,
    });
    res.json({
      message: "berhasil",
    });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
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
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.level_id == 1 ? "admin" : "officer",
          },
          process.env.JWT_SIGN,
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
  } catch (er) {}
}

async function registerAdmin(req, res) {
  try {
    let body = req.body;
    body.password = await bcrypt.hashSync(body.password, 10);
    let url = `${req.protocol}://${req.get("host")}/${req?.file?.filename}`;
    if (url === `${req.protocol}://${req.get("host")}/undefined`) {
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
    const user = await admin.create({
      name: body.name,
      email: body.email,
      username: body.username,
      password: body.password,
      level_id: 1,
    });
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: "admin",
      },
      process.env.JWT_SIGN,
    );
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
  login,
  listOfficer,
  deleteOfficer,
  addOfficer,
  createLevel,
};
