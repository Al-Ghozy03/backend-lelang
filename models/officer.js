'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class officer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      officer.belongsToMany(models.level,{as:"level",foreignKey:"id",through:""})
      officer.hasMany(models.lelang,{as:"lelang",foreignKey:"idOfficer"})
      officer.hasMany(models.token_officer,{as:"token_officer",foreignKey:"officerId"})
    }
  }
  officer.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    level_id: DataTypes.INTEGER,
    photoProfile: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'officer',
  });
  return officer;
};