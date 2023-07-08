const router = require("express").Router();
const userRoutes = require("./userRoutes.js");
//const dataRoutes = require("./dataRoutes.js");

router.use("/user", userRoutes);
// router.use("/api", dataRoutes);

router.use((req, res) => {
  return res.send("Wrong route!");
});

module.exports = router;
