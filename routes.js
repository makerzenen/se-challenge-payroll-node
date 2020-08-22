const express = require("express"),
  multiparty = require("multiparty"),
  csv = require("csv-parser"),
  fs = require("fs");
const logger = require("./logger.js"),
  queries = require("./queries.js");

const router = express.Router();

async function checkTimeReportId(timeReportId, filename, res) {
  const existingTimeReportIds = await queries.getTimeReportIds();
  if (existingTimeReportIds.includes(timeReportId)) {
    res.status(400).send({ message: `Duplicate processing error: ${filename} already processed.` });
    return;
  }
}

function parseTimeReportId(filename) {
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

function parseTimeReportCsv(timeReportId, filename) {
  const results = [];
  const headers = ["date", "hoursWorked", "employeeId", "jobGroup"];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(csv({ strict: true, skipLines: 1, headers: headers}))
      .on("data", (data) => results.push(data))
      .on("data", (data) => logger.debug(data))
      .on("error", (error) => reject(err))
      .on("end", () => {
        logger.info(
          `Payroll ID ${timeReportId} successfully processed ${
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

router.get("/payroll-report", async (req, res) => {
  try {
    const payrollReport = await queries.getPayrollReport();
    res.json({ payrollReport: payrollReport });
  } catch (error) {
    res.status(400).send({ message: "Unable to generate payroll report." });
    return;
  }
});

router.post("/time-report-upload", async (req, res) => {
  // Parse form for file upload.
  const form = new multiparty.Form();
  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.status(400).send({ message: "Invalid request.", error: err.message });
      return;
    }
    const filename = files.file[0].originalFilename;
    const filepath = files.file[0].path;
    // Validate payroll ID from filename.
    const timeReportId = parseTimeReportId(files.file[0].originalFilename);
    if (!timeReportId) {
      res.status(400).send({ message: `Invalid filename: ${filename}.` });
      return;
    }
    // Check for duplicate payroll file upload.
    await checkTimeReportId(timeReportId, filename, res);
    // Parse CSV rows.
    const results = parseTimeReportCsv(timeReportId, filepath);
    results.then((entries) => {
      try {
        // Insert CSV rows.
        // Insert missing employees.
        queries.insertMissingEmployees(entries);
        // Insert time report.
        queries.insertTimeReport(timeReportId);
        // Insert time report entries.
        queries.insertTimeReportEntries(timeReportId, entries);
        // Mark time report as successful.
        queries.successTimeReportProcessing(timeReportId);
        // Success message.
        res.json({ message: "File uploaded and processed successfully." });
      } catch (error) {
        // Mark time report as failed.
        queries.failTimeReportProcessing(timeReportId);
        // Failure message.
        res.status(400).send({ message: `Processing failed: ${filename} is invalid.` });
      }
    });
  });
});

module.exports = router;
