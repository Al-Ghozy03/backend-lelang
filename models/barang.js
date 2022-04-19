'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class barang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      barang.hasMany(models.lelang,{as:"lelang",foreignKey:"idBarang"})
      barang.hasMany(models.history_lelang,{as:"history_lelang",foreignKey:"idBarang"})
    }
  }
  barang.init({
    namaBarang: DataTypes.STRING,
    tanggal: DataTypes.DATE,
    jam: DataTypes.TIME,
    hargaAwal: DataTypes.INTEGER,
    deskripsi: DataTypes.STRING,
    kategori: DataTypes.STRING,
    fotoBarang: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'barang',
  });
  return barang;
};