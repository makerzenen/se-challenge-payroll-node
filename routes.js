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
    logger.info(`Parsed payroll of ID: ${id}.`);
    return id;
  } else {
    logger.error(`Unable to parse payroll ID from: ${filename}.`);
    return false;
  }
}

router.get("/", (req, res) => {
  res.json({ message: "se-challenge-payroll /" });
});

router.get("/ping", (req, res) => {
  res.json({ message: "se-challenge-payroll /ping" });
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
    // Parse CSV rows into array.
    const results = [];
    const failedResults = [];
    fs.createReadStream(filepath)
      .pipe(csv({ strict: true }, headers))
      .on("data", (data) => results.push(data))
      .on("data", (data) => logger.debug(data))
      .on("error", (error) => failedResults.push(error))
      .on("error", (error) => logger.debug(error))
      .on("end", () => {
        logger.info(
          `Payroll ID ${fileId} successfully processed ${
            Object.keys(results).length
          } entries.`,
        );
        if (failedResults > 0) {
          logger.error(
            `Payroll ID ${fileId} failed to process ${
              Object.keys(failedResults).length
            } entries.`,
          );
        }
      });
    res.json({ message: "File uploaded and processed successfully." });
  });
});

module.exports = router;
