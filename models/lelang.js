'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class lelang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      lelang.belongsToMany(models.user,{as:"user",foreignKey:"id",through:""})
      lelang.belongsToMany(models.barang,{as:"barang",foreignKey:"id",through:""})
      lelang.belongsToMany(models.officer,{as:"officer",foreignKey:"id",through:""})
      lelang.hasMany(models.history_lelang,{as:"history_lelang",foreignKey:"idLelang",through:""})
    }
  }
  lelang.init({
    idBarang: DataTypes.INTEGER,
    tanggalLelang: DataTypes.DATE,
    hargaAkhir: DataTypes.INTEGER,
    idUser: DataTypes.INTEGER,
    idOfficer: DataTypes.INTEGER,
    status: DataTypes.ENUM("opened","closed")
  }, {
    sequelize,
    modelName: 'lelang',
    // freezeTableName:true

  });
  return lelang;
};