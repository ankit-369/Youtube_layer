const express = require("express");
const creator = require("./creator");
const router = express.Router();
const auth = require("./auth");


router.use("/auth",auth);
router.use("/creator",creator);

module.exports = router;