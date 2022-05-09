
const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
  {
    name: {
      field: "name",
      type: DataTypes.STRING,
    },
    age: {
      field: "age",
      type: DataTypes.INTEGER,
    },
    sex: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
  })
  return User;
}
