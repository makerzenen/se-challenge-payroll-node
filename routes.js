const express = require("express"),
  multiparty = require("multiparty"),
  csv = require("csv-parser"),
  fs = require("fs");
const logger = require("./logger.js"),
  queries = require("./queries.js");

const router = express.Router();

const headers = ["date", "hoursWorked", "employeeId", "jobGroup"];

function parsePayrollId(filename) {
  const matches = filename.match(/\d+/);
  if (matches) {
    const id = matches[0];
    logger.info(`Parsed payroll filename with ID: ${id}.`);
    return id;
  } else {
    logger.error(`Unable to parse payroll ID from: ${filename}.`);
    return false;
  }
}

function parsePayrollCsv(filename, fileId, headers) {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
    .pipe(csv({ strict: true }, headers))
    .on("data", (data) => results.push(data))
    .on("data", (data) => logger.debug(data))
    .on("error", (error) => reject(err))
    .on("end", () => {
      logger.info(
        `Payroll ID ${fileId} successfully processed ${
          Object.keys(results).length
        } entries.`,
      );
      resolve(results);
    });
  })
}

router.get("/", (req, res) => {
  res.json({ message: "welcome" });
});

router.get("/ping", (req, res) => {
  res.json({ message: "ping" });
});

router.get("/payroll-report", (req, res) => {
  const payrollReport = queries.getPayrollReport();
  res.json({ payrollReport: payrollReport });
});

router.post("/payroll-upload", (req, res) => {
  // Parse form for file upload.
  const form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.status(400).send({ message: "Invalid request.", error: err.message });
      return;
    }
    const filename = files.file[0].originalFilename;
    const filepath = files.file[0].path;
    // Validate payroll ID from filename.
    const fileId = parsePayrollId(files.file[0].originalFilename);
    if (!fileId) {
      res.status(400).send({ message: `Invalid filename: ${filename}.` });
      return;
    }
    // Parse CSV rows.
    const results = parsePayrollCsv(filepath, fileId, headers);
    results.then((result) => { 
      res.json({ message: "File uploaded and processed successfully." });
    });
  });
});

module.exports = router;
