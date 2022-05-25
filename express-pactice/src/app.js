const express = require("express");

const app = express();

const mysql = require("mysql2");

const db = require("../models/index");

const { userValidation } = require("./validation");

const cors = require("cors");

const { sequelize } = require("../models/index");
const { response } = require("express");


const PORT = 3000;

app.use(cors());
app.use(express.json());

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

const posts = [{ title: "My favorite food" }, { sub: "Love life" }];

app.get("/", (req, res) => {
  res.send({
    msg: "Hello",
    user: {},
  });
});

// Now we get our users from our database

app.get("/users", async (req, res) => {
  let users = await db.User.findAll();

  res.json(users);
  
});
  
//We are trying to validate the value of the data before posting it to our database

app.post("/users", async (req, res, next) => {
  const {error} = userValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    console.log('Data is being saved to express db');
    res.status(200).json({message: "data is saved"});
  };

  // After validation, Now we push
 
  users.push(req.body);

  // We have successfully pushed, Now we create the data in our database

  await db.User.create(req.body)
    .then(() => {
      res.end();
    })
    .catch((error) => {
      res.status(404).end();
    });
});

app.get("/users/:name", async (req, res) => {
  const { name } = req.params;
  const user = await db.User.findOne({
    where: { name: name}
  });

  if(user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("Not found");
  }
});

app.get("users/:age", async (req, res) => {
  const { age } = req.params;
  const user = await db.User.findOne({
    where: {
      age: {
        [Op.Ite]: age,
      },
    },
  });

  if(user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("Not found");
  }

});






app.post("users");
