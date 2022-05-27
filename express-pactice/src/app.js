const express = require("express");

const usersRoute = require("./routes/users");

const app = express();

const mysql = require("mysql2");

const db = require("../models/index");

const { userValidation } = require("./validation");

const cors = require("cors");

const { sequelize } = require("../models/index");
const { response } = require("express");
const { Op } = require("sequelize");

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(usersRoute);

app.listen(PORT, async () => {
  await db.sequelize.sync({ alter: true });
  console.log(`Express server running on port ${PORT}!`);
});
/*
const users = [
  { name: "Benzo", age: 22 },
  { name: "Lala", age: 55 },
  { name: "Robo", age: 43 },
];
*/

