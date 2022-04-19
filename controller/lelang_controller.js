const lelangmodel = require("../models").lelang;
const historyLelang = require("../models").history_lelang;
const barang = require("../models").barang;
const usermodel = require("../models").user;
const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const { default: jwtDecode } = require("jwt-decode");


async function generateLaporan(req, res) {
  const data = await sequelize.query(
    `select a.id,a.namaBarang,a.tanggal,a.fotoBarang,b.hargaAkhir,c.name,c.email,c.photoProfile,d.name as name_officer,d.email as email_officer,d.username as username_officer from barangs as a left join lelangs as b on (a.id = b.idBarang) left join users as c on (b.idUser = c.id) left join officers as d on (b.idOfficer = d.id)`,
    {
      type: QueryTypes.SELECT,
      raw: true,
    }
  );
  try {
    res.json({
      status: "berhasil",
      data: data,
    });
  } catch (er) {
    console.log(er);
  }
}


async function history(req, res) {
  try {
    const { id } = req.params;
    const data = await sequelize.query(
      `select a.id,a.idLelang,a.idBarang,a.idUser,a.penawaranHarga,b.name,b.email,b.photoProfile from history_lelangs as a join users as b on (a.idUser = b.id) where a.idLelang = ${id} order by a.penawaranHarga desc limit 0,5`,
      { type: QueryTypes.SELECT, raw: true }
    );
    res.json({ data: data });
  } catch (er) {
    console.log(er);
  }
}

async function getListPenawar(req, res) {
  try {
    const { id } = req.params;
    const data = await sequelize.query(
      `select a.id,a.idBarang,a.hargaAkhir,a.idUser,a.idOfficer,a.status,c.name from lelangs as a join history_lelangs as b on (a.idUser = b.idUser) join users as c on (b.idUser = c.id) where a.id = ${id}`,
      {
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    res.status(200).json({ message: "berhasil", data: data });
  } catch (er) {
    console.log(er);
  }
}

async function scheduleDetail(req, res) {
  try {
    const { id } = req.params;
    const data = await sequelize.query(
      `select barangs.id,barangs.namaBarang,barangs.tanggal,barangs.hargaAwal,barangs.jam,barangs.deskripsi,barangs.fotoBarang,lelangs.idBarang,lelangs.hargaAkhir,lelangs.idUser,lelangs.idOfficer,lelangs.status,officers.username from barangs join lelangs on(barangs.id = lelangs.idBarang) join officers on (lelangs.idOfficer = officers.id) where lelangs.idBarang = ${id}`,
      { type: QueryTypes.SELECT, raw: true }
    );
    res.json({ message: "berhasil", data: data });
  } catch (er) {
    return res.status(442).json({
      message: "gagal",
      error: er,
    });
  }
}
async function schedule(req, res) {
  try {
    const data = await sequelize.query(
      "select barangs.id,barangs.namaBarang,barangs.tanggal,barangs.jam,barangs.deskripsi,barangs.fotoBarang,lelangs.idBarang,lelangs.hargaAkhir,lelangs.idUser,lelangs.idOfficer,lelangs.status,officers.username from barangs join lelangs on(barangs.id = lelangs.idBarang) join officers on (lelangs.idOfficer = officers.id)",
      { type: QueryTypes.SELECT, raw: true }
    );
    res.json({ message: "berhasil", data: data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({
      message: "gagal",
      error: er,
    });
  }
}

async function updateData(req, res) {
  const { hargaAkhir, idUser, status } = req.body;
  const { id } = req.params;
  try {
    const data = await lelangmodel.findByPk(id);
    if (!data) return res.status(442).json({ message: "data tidak ada" });
    lelangmodel.update(
      { hargaAkhir: hargaAkhir, idUser: idUser, status: status },
      { where: { id: id } }
    );
    res.json({ message: "berhasil update" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ message: "gagal", error: er });
  }
}

async function penawaran(req, res) {
  try {
    let { authorization } = req.headers;
    let { id } = req.params;
    let body = req.body;
    const getIdUser = jwtDecode(authorization);
    const data = await lelangmodel.findByPk(id);

    if (!data) return res.status(442).json({ message: "data tidak ada" });

    if (getIdUser.role !== "user")
      return res.status(442).json({ message: "hanya user yang bisa menawar" });

    const lelang = await lelangmodel.findAll({ where: { idBarang: id } });
    if (lelang[0].hargaAkhir >= parseInt(body.hargaAkhir))
      return res.status(442).json({ message: "penawaran harus lebih besar" });

    await lelangmodel.update(
      {
        hargaAkhir: body.hargaAkhir,
        idUser: getIdUser.id,
      },
      { where: { idBarang: id } }
    );
    await historyLelang.create({
      idLelang: data.id,
      idBarang: data.idBarang,
      idUser: getIdUser.id,
      penawaranHarga: body.hargaAkhir,
    });
    res.status(200).json({ message: "berhasil" });
  } catch (er) {
    console.log(er);
    return res.status(442).json({
      message: "gagal",
      error: er,
    });
  }
}

module.exports = {
  updateData,
  penawaran,
  scheduleDetail,
  schedule,
  getListPenawar,
  history,
  generateLaporan,
};
