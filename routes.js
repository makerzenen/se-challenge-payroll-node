const express = require("express");
const logger = require("./logger.js");

const router = express.Router();

router.get("/", (req, res) => {
	logger.info("/homepage");
	res.json({ message: "se-challenge-payroll homepage" } )
});

router.get("/ping", (req, res) => {
	logger.info("/ping");
	res.json({ message: "se-challenge-payroll ping" } )
});

module.exports = router;
