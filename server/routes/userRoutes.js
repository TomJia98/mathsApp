const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const router = require("express").Router();
const { User } = require("../models");
const withAuth = require("../utils/auth");

//check all users
router.get("/all", async (req, res) => {
  //send the user all the users in the database, if they have the key
  try {
    if (req.body.UNIQUEKEY !== process.env.UNIQUEKEY) {
      res.send("You need to be verified to access this route");
    } else {
      const allUsers = await User.find();
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
    if (!req.body) {
      console.log("user has not sent any details");
      res.send("please send your details for creation");
    }
    const createUser = await User.create(req.body);
    req.session.save(() => {
      req.session.user_id = createUser._id;
      req.session.logged_in = true;
      res.status(200).json(createUser);
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
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
        user: userData,
        message: `Hello ${userData.username}, welcome back!`,
      });
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//logout
router.get("/logout", withAuth, async (req, res) => {
  try {
    req.session.destroy(() => {
      res.status(204).redirect("/home");
      //make sure to impliment a home page to redirect to!
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

// get single users data, and populate all fields
router.get("/", withAuth, async (req, res) => {
  try {
    const currentUser = await User.findOne({ _id: req.session.user_id })
      .populate("Session")
      .populate("Response");
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

// router.("/", async (req, res) => {
//     try {

//     } catch (err)
//      { console.error(err)
//         res.send(err)
//     }

// })
