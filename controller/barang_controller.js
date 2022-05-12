const { body } = require("express-validator");
const { default: jwtDecode } = require("jwt-decode");
const { Op } = require("sequelize");

const barang = require("../models").barang;
const lelangmodel = require("../models").lelang;
const laporanmodel = require("../models").laporan;

async function getNol(req, res) {
  try {
    const data = await barang.findAndCountAll({ where: { hargaAwal: "0" } });
    res.json({ data });
  } catch (er) {
    console.log(er);
  }
}

async function generateReport(req, res) {
  try {
    const { userId, namaBarang, hargaAkhir } = req.body;
    await laporanmodel.create({
      userId: userId,
      idBarang: namaBarang,
      hargaAkhir: hargaAkhir,
    });
    res.json({ message: "berhasil" });
  } catch (er) {
    console.log(er);
    res.status(442).json({ message: "gagal" });
  }
}

async function getByCategories(req, res) {
  try {
    const data = await barang.findAndCountAll({
      where: { kategori: req.query.category },
    });
    res.json({ message: "berhasil", data: data });
  } catch (er) {
    console.log(er);
    res.status(442).json({ message: "gagal" });
  }
}
async function today(req, res) {
  try {
    let date = new Date();
    let today = `${date.getFullYear()}-${
      date.getMonth() + 1 === 1 ||
      date.getMonth() + 1 === 2 ||
      date.getMonth() + 1 === 3 ||
      date.getMonth() + 1 === 4 ||
      date.getMonth() + 1 === 5 ||
      date.getMonth() + 1 === 6 ||
      date.getMonth() + 1 === 7 ||
      date.getMonth() + 1 === 8 ||
      date.getMonth() + 1 === 9
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1
    }-${
      date.getDate() === 1 ||
      date.getDate() === 2 ||
      date.getDate() === 3 ||
      date.getDate() === 4 ||
      date.getDate() === 5 ||
      date.getDate() === 6 ||
      date.getDate() === 7 ||
      date.getDate() === 8 ||
      date.getDate() === 9
        ? `0${date.getDate()}`
        : date.getDate()
    }`;

    const data = await barang.findAll({
      where: { tanggal: { [Op.substring]: today } },
    });
    res.json({ data: data });
  } catch (er) {
    console.log(er);
    return res.status(442).json({ er });
  }
}

async function deleteBarang(req, res) {
  try {
    const { id } = req.params;
    await barang.destroy({ where: { id: id } });
    res.json({ message: "berhasil" });
  } catch (er) {
    console.log(er);
  }
}

async function updateBarang(req, res) {
  try {
    const { id } = req.params;
    let body = req.body;
    const data = await barang.findByPk(id);
    if (!data) return res.status(442).json({ message: "data tidak ada" });

    let url = `${req.protocol}://${req.get("host")}/${req?.file?.filename}`;
    if (url === `${req.protocol}://${req.get("host")}/undefined`) {
      body.fotoBarang = data.fotoBarang;
    } else {
      body.fotoBarang = url;
    }

    await barang.update(
      {
        namaBarang: body.namaBarang,
        tanggal: body.tanggal,
        jam: body.jam,
        hargaAwal: body.hargaAwal,
        deskripsi: body.deskripsi,
        kategori: body.kategori,
        fotoBarang: body.fotoBarang,
      },
      { where: { id: id } }
    );
    const data2 = await barang.findByPk(id);

    lelangmodel.update(
      { hargaAkhir: data2.hargaAwal, tanggalLelang: data2.tanggal },
      { where: { idBarang: id } }
    );
    res.json({
      message: "berhasil update",
    });
  } catch (er) {
    console.log(er);
    return res.status(442).json({
      message: "gagal",
      error: er,
    });
  }
}

async function detail(req, res) {
  try {
    const { id } = req.params;
    const data = await barang.findAndCountAll({
      where: { id: id },
      include: [
        {
          model: lelangmodel,
          require: true,
          as: "lelang",
          attributes: [
            "id",
            ["tanggalLelang", "tanggal"],
            "hargaAkhir",
            "idUser",
            "idOfficer",
            "status",
          ],
        },
      ],
    });
    res.json({
      data: data,
    });
  } catch (er) {
    console.log(er);
  }
}

async function searchBarang(req, res) {
  try {
    const { key, sortBy, orderBy, page, pageSize } = req.query;
    let size = (parseInt(page) - 1) * parseInt(pageSize);
    const data = await barang.findAndCountAll({
      where: {
        namaBarang: {
          [Op.substring]: key,
        },
      },
      order: [[!sortBy ? "id" : sortBy, !orderBy ? "asc" : orderBy]],
      offset: page === undefined ? 0 : size,
      limit: pageSize === undefined ? 10 : parseInt(pageSize),
    });
    res.json({
      data: data,
    });
  } catch (er) {
    return res.status(442).json({
      message: "gagal",
      error: er,
    });
  }
}

async function getAll(req, res) {
  try {
    const { sortBy, orderBy, page, pageSize } = req.query;
    let size = (parseInt(page) - 1) * parseInt(pageSize);
    const data = await barang.findAndCountAll({
      attributes: [
        "id",
        "namaBarang",
        "jam",
        "tanggal",
        "hargaAwal",
        "deskripsi",
        "fotoBarang",
      ],
      include: [
        {
          model: lelangmodel,
          require: true,
          as: "lelang",
          attributes: [
            "id",
            ["tanggalLelang", "tanggal"],
            "hargaAkhir",
            "idUser",
            "idOfficer",
            "status",
          ],
        },
      ],
      order: [[!sortBy ? "id" : sortBy, !orderBy ? "asc" : orderBy]],
      offset: page === undefined ? 0 : size,
      limit: pageSize === undefined ? 10 : parseInt(pageSize),
    });
    res.json({
      status: "berhasil",
      data: data,
      pagination: {
        pageActive: parseInt(page),
        nextPage: parseInt(page) + 1,
        prevPage: parseInt(page) - 1,
      },
    });
  } catch (er) {}
}

async function postBarang(req, res) {
  let body = req.body;
  try {
    const { authorization } = req.headers;
    let getId = jwtDecode(authorization);
    let url = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
    body.fotoBarang = url;
    const data = await barang.create(body);
    await lelangmodel.create({
      idBarang: data.id,
      tanggalLelang: data.tanggal,
      hargaAkhir: data.hargaAwal,
      status: "closed",
      idOfficer: getId.id,
    });
    res.status(200).json({
      status: "berhasil",
      data: data,
    });
  } catch (er) {
    console.log(er);
    res.status(422).json({ message: "gagal", error: er });
  }
}

async function getOther(req, res) {
  try {
    const data = await barang.findAll({
      where: { hargaAwal: { [Op.ne]: 0 } },
      limit: 2,
    });
    res.json({ data });
  } catch (er) {
    return res.status(442).json({ er });
  }
}

module.exports = {
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
};
