'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class history_lelang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      history_lelang.belongsToMany(models.user,{as:"users",foreignKey:"id",through:""})
      history_lelang.belongsToMany(models.lelang,{as:"lelang",foreignKey:"id",through:""})
      history_lelang.belongsToMany(models.barang,{as:"barang",foreignKey:"id",through:""})
    }
  }
  history_lelang.init({
    idLelang: DataTypes.INTEGER,
    idBarang: DataTypes.INTEGER,
    idUser: DataTypes.INTEGER,
    penawaranHarga: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'history_lelang',
  });
  return history_lelang;
};