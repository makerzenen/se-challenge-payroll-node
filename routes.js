const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
	res.send("se-challenge-payroll homepage")
});

router.get("/ping", (req, res) => {
	res.send("se-challenge-payroll ping")
});

module.exports = router;
