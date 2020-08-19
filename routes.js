const express = require("express"),
  multiparty = require("multiparty"),
  csv = require("csv-file-validator");
const logger = require("./logger.js");

const router = express.Router();

const csvConfig = {
  headers: [
    {
      name: "date",
      inputName: "date",
      required: true,
      requiredError: (headerName, rowNumber, columnNumber) => {
        return `${headerName} is required in the ${rowNumber} row : ${columnNumber} column.`
      }
    }, {
      name: "hours worked",
      inputName: "hoursWorked",
      required: true,
      requiredError: (headerName, rowNumber, columnNumber) => {
        return `${headerName} is required in the ${rowNumber} row : ${columnNumber} column.`
      }
    }, {
      name: "employee id",
      inputName: "employeeId",
      required: true,
      requiredError: (headerName, rowNumber, columnNumber) => {
        return `${headerName} is required in the ${rowNumber} row : ${columnNumber} column.`
      }
    }, {
      name: "job group",
      inputName: "jobGroup",
      required: true,
      requiredError: (headerName, rowNumber, columnNumber) => {
        return `${headerName} is required in the ${rowNumber} row : ${columnNumber} column.`
      }
    }
  ]
}

router.get("/", (req, res) => {
  logger.info("/homepage");
  res.json({ message: "se-challenge-payroll homepage" });
});

router.get("/ping", (req, res) => {
  logger.info("/ping");
  res.json({ message: "se-challenge-payroll ping" });
});

router.post("/payroll-upload", (req, res) => {
  logger.info("/payroll-upload");
  // Parse form for file upload.
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) {
    // 0. Validate CSV.
    // 1. Parse and insert time report id.
    // 2. Insert missing employees.
    // 3. Insert payroll entries.
    csv(files[0], csvConfig)
      .then(csvData => {
        logger.info("/payroll-upload", csvData.data);
        logger.info("/payroll-upload", csvData.inValidMessages);
      }).catch(err => {
        logger.error("/payroll-upload");
      })
    res.json({ message: "File uploaded successfully." })
  })
});

module.exports = router;
