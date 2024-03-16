const express = require("express");
const creator = require("./creator");
const router = express.Router();
const auth = require("./auth");
const editor = require("./editor")

router.use("/auth",auth);
router.use("/creator",creator);
router.use("/editor",editor);

module.exports = router;