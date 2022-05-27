const { Router } = require('express');

const router = Router;


// Now we get our users from our database

router.get("/users", async (req, res) => {
  let users = await db.User.findAll();

  res.json(users);
  
});
  
//We are trying to validate the value of the data before posting it to our database

router.post("/users", async (req, res, next) => {
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

router.get("/users/:name", async (req, res) => {
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

router.get("/users/age/:age", async (req, res) => {
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
  router.put('/users/:name', async (req, res) => {
    
  })

});




module.exports = router;