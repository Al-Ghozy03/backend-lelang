"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.lelang, { as: "lelang", foreignKey: "idUser" });
      user.hasMany(models.history_lelang, {
        as: "history",
        foreignKey: "idUser",
      });
    }
  }
  user.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      photoProfile: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
      // freezeTableName: true,
    }
  );
  return user;
};
