'use strict';

const express = require("express");

const app = express();

const mysql = require("mysql2");

const db = require("../models/index");

const { userValidation } = require("./validation");

const { userMap } = require("./mapper");

const { roleMap } = require("./roles");

const cors = require("cors");

const { sequelize } = require("../models/index");
const { response } = require("express");
const { Op } = require("sequelize");

const PORT = 3000;

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  
  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  
  let author = userMap.get(username);
  if(!author ){
    let error = getError(5);
    res.status(error.statusCode)
       .json(error.data);
  } 
  
  // Verify login and password are set and correct
  if (username && password &&   password === author.password) {
    req.author = {
      authorUsername: username,
      authorRole: author.role,
      authorPassword: author.password
    };
    return next()
  }
  
  let error = getError(5);
  res.status(error.statusCode)
       .json(error.data);
});


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


app.get("/", (request, response) => {
  res.sendStatus(404);
});

app.delete("/users", (request, response) => {
  let {authorRole,authorUsername,authorPassword} = request.author;
  let {role,password,username} = request.body;

  
  let author = userMap.get(authorUsername);
  
  if(author.role === "admin"){
    userMap = new Map();
    userMap.set("admin",{
            "username":"admin",
            "password":"admin",
            "role":"admin",
            "users":[]
            });
  
    response.sendStatus(204);
  }else{
    response.status(401)
            .json({"message":"Unauthorized"});
  }
 
  
});


app.delete("/user", (request, response) => {
  let {authorRole,authorUsername,authorPassword} = request.author;
  let {role,password,username} = request.body;
  if(username === "admin"){
    response.status(403)
            .json({"message":"Forbidden"});
  }
  
  let author = userMap.get(authorUsername);
  
  if(!username) response.sendStatus(400);
 
  
  if(!isChildUser(username,author)) response.sendStatus(403);
  
  deleteChild(username,author);
  response.sendStatus(204);
  
});

function deleteChild(childUsername,author){
  author.users = author.users.filter(username => username !== childUsername);
  
  let child = userMap.get(author.username);
  
  if(child.role !== "user"){
    for(let pikin of child.users){
      deleteChild(pikin,child);
    }
  }else{
    userMap.delete(child.username);
  }
}

function isChildUser(childUsername,author){
  for(let username of author.users){
    if(username === childUsername) return true;
  }
  return false;
}

app.get("/user", (request, response) => {
  let {authorRole,authorUsername,authorPassword} = request.author;
  let user = userMap.get(authorUsername);
  user = expandUser(user);
  //console.log(user);
  
  response.status(200)
      .json(user)
    
});

app.get("/reset",(request, response) => {
 userMap = new Map();
  userMap.set("admin",{
            "username":"admin",
            "password":"admin",
            "role":"admin",
            "users":[]
            });
  
  response.end();
    
});


function expandUser(user){
  let expandedUser = [];
  
  for(let username of user.users){
    let embeddedUser = userMap.get(username);
    if(embeddedUser.role !== "user"){
      embeddedUser = expandUser(embeddedUser);
    }
    expandedUser.push(embeddedUser);
  }
  
  user.users = expandedUser;
  return user;
}


app.post("/user", (request,response) => {
  const postUserResponse = addUser(request.body,request.author);
  //console.log(`author => ${request.author.authorUsername} => ${request.body.username}`);
  response.status(postUserResponse.statusCode)
          .json(postUserResponse.data);
});

function getError(value){
  var errorMessages = [
    {
      "statusCode":401,
      "message":"Unauthorized"
    },
    {
      "statusCode":400,
      "message":"Missing mandatory fields"
    },
    {
      "statusCode":403,
      "message":"Forbidden"
    },
    {
      "statusCode":409,
      "message":"User Already Exists"
    },
    {
      "statusCode":403,
      "message":"Forbidden operation"
    },
    {
      "statusCode":401,
      "message":"Unauthorized"
    }
    
  ]
  
  return {
      "statusCode":errorMessages[value]["statusCode"],
      "data":{
        "message":errorMessages[value]["message"]
        },
      "status":false
    };
}

function validateUser(userDetails,authorDetails){
  let {role,password,username} = userDetails;
  
  if(!role || !password || !username) return getError(1);
  if(role === "admin") return getError(2);
  if(userMap.get(username)) return getError(3);
  
  let {authorRole,authorUsername,authorPassword} = authorDetails;
  let authorRoleRank = roleMap.get(authorRole);
  let newUserRoleRank = roleMap.get(role);
  
  if(authorRoleRank >= newUserRoleRank) return getError(4);
  if(role === "admin") return getError(2);
  
  return {
    "statusCode":200,
    "status":true
  }
  
}


function addUser(requestBody,authorDetails){
  let validationResult = validateUser(requestBody,authorDetails);
  if(!validationResult.status) return validationResult;
  
  let {authorRole,authorUsername,authorPassword} = authorDetails;
  let {role,password,username} = requestBody;
  userMap.get(authorUsername).users.push(username);
  
  let userModel = {
    "username":username,
    "password": password,
    "role":role,
    "users":[]
  };
  
  userMap.set(username,userModel);
  
  return {
      "statusCode":201,
      "data":userModel,
      "status":true
    };
}


module.exports = app; 

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
 
 // users.push(req.body);

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

app.get("/users/age/:age", async (req, res) => {
  const { age } = req.params;
  const user = await db.User.findAll({
    where: {
      age: {
        [Op.lte]: age,
      },
    },
  });

  
  if(user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("Not found");
  }
});

app.get("/users/id/:id", async (req, res) => {
  const { id } = req.params;
  const user = await db.User.findAll({
    where: {
      id: {
        [Op.gte]: id,
      },
    },
  });

  
  if(user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("Not found");
  }
});

app.put('/users/:name', async (req, res) => {
  const { name } = req.params;
  const user = await db.User.findOne({
    where: { name: name}
  });

  const { age, sex } = req.body;


  await db.User.update({ age: age, sex: sex}, {
    where: {
      name: name,
    }
  });

  if(user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("Not found");
  }

});

