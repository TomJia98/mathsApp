const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const router = require("express").Router();
const { User, Session, Response } = require("../models");
const withAuth = require("../utils/auth");

//check all users
router.get("/all:UNIQUEKEY", async (req, res) => {
  //send the user all the users in the database, if they have the key
  try {
    if (req.params.UNIQUEKEY !== process.env.UNIQUEKEY) {
      res.send("You need to be verified to access this route");
    } else {
      const allUsers = await User.find()
        .populate("Session")
        .populate("Response");
      res.status(200).json(allUsers);
    }
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

// create a new user
router.post("/", async (req, res) => {
  try {
    console.log("attenpting to create new user " + req.body.username);
    if (!req.body.username || !req.body.password) {
      console.log("user has not sent any details");
      res.send("please send your details for creation");
    }
    const checkIfUsernameIsTaken = await User.findOne({
      username: req.body.username,
    });
    console.log(checkIfUsernameIsTaken);
    if (!checkIfUsernameIsTaken) {
      const createUser = await User.create(req.body);
      req.session.save(() => {
        req.session.user_id = createUser._id;
        req.session.logged_in = true;
        res.status(200).json({
          username: createUser.username,
          message: `welcome, ${createUser.username}`,
          success: true,
        });
      });
    } else {
      res.status(400).json({ message: "username is already taken" });
      return;
    }
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      username: req.body.username,
    });
    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect username or password, please try again" });
      return;
    }
    const validPw = await userData.isCorrectPassword(req.body.password);
    if (!validPw) {
      res
        .status(400)
        .json({ message: "Incorrect username or password, please try again" });
      return;
    }
    req.session.save(() => {
      req.session.user_id = userData._id;
      req.session.logged_in = true;
      res.status(200).json({
        message: `Hello ${userData.username}, welcome back!`,
      });
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//logout remember to redirect back to home when done
router.get("/logout", withAuth, async (req, res) => {
  try {
    req.session.destroy(() => {
      console.log("logging out user");
      res.status(200).json({ message: "see ya!" });
      //.redirect("/home");
      //make sure to impliment a home page to redirect too!
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

// get single users data, and populate all fields
router.get("/", withAuth, async (req, res) => {
  try {
    const currentUser = await User.findOne(
      { _id: req.session.user_id },
      { password: 0 }
    )
      .populate({ path: "Session", strictPopulate: false })
      .populate({ path: "Response", strictPopulate: false });
    if (!currentUser) {
      res.status(400).json({ message: "could not find current user" });
      return;
    }
    res.status(200).json({ user: currentUser });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//delete the current user from the database, as well as all their data
router.delete("/", withAuth, async (req, res) => {
  try {
    const deleteUser = await User.findOneAndDelete({
      _id: req.session.user_id,
    });

    if (!deleteUser) {
      return res.status(404).json({ message: "No user with this id!" });
    }
    for (const session of deleteUser.sessions) {
      await Response.deleteMany({ _id: { $in: session.response } });
    }
    await Session.deleteMany({ _id: { $in: deleteUser.sessions } });
    req.session.destroy(() => {
      console.log(`user ${deleteUser.username} has been wiped from the server`);
      res.json({
        message: `user ${deleteUser.username} has been wiped from the server`,
      });
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//update user
router.put("/", withAuth, async (req, res) => {
  try {
    if (req.body.username) {
      const checkIfTaken = await User.findOne({ username: req.body.username });
      if (checkIfTaken) {
        res.status(400).json({ message: "username is already taken" });
        return;
      }
    }
    const updateUser = await User.findOneAndUpdate(
      { _id: req.session.user_id },
      req.body,
      { new: true }
    );
    res
      .status(200)
      .json({ message: `user ${updateUser.username} successfully updated` });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

// router.("/", async (req, res) => {
//     try {

//     } catch (err)
//      { console.error(err)
//         res.send(err)
//     }

// })
module.exports = router;
