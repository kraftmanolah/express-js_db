const express = require("express");

const app = express();

const mysql = require("mysql2");

const db = require("../models/index");

const cors = require("cors");

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, async () => {
  await db.sequelize.sync({ alter: true });
  console.log(`Express server running on port ${PORT}!`);
});

const users = [
  { name: "Benzo", age: 22 },
  { name: "Lala", age: 55 },
  { name: "Robo", age: 43 },
];

const posts = [{ title: "My favorite food" }, { sub: "Love life" }];

app.get("/", (req, res) => {
  res.send({
    msg: "Hello",
    user: {},
  });
});

app.get("/users", (req, res) => {
  res.send(users);
});

app.post("/users",async (req, res, next) => {
  console.log(req.body);
  res.sendStatus(201);
  users.push(req.body);

  await db.User.create(req.body)
    .then(() => {
      res.end();
    })
    .catch((error) => {
      res.status(404).end();
    });
});

app.get("/users/:name", (req, res) => {
  const { name } = req.params;
  const user = users.find((user) => user.name === name);
  if (user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("Not found");
  }
});
app.post("users");
