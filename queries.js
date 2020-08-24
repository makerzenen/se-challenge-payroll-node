const knex = require("./knexfile.js"),
  db = require("knex")(knex),
  moment = require("moment");
const logger = require("./logger.js");

// Pad number with places zeros.
function zeroPad(number, places) {
  return String(number).padStart(places, "0");
}

// Get pay period start and end dates.
function getPayPeriod(workDate) {
  const dateParts = workDate.split("/");
  const date = moment(
    `${dateParts[2]}-${zeroPad(dateParts[1], 2)}-${zeroPad(dateParts[0], 2)}`,
  );
  let entry = {};
  if (+date.format("D") <= 15) {
    entry.startDate = moment(`${date.year()}-${date.month() + 1}-01`);
    entry.endDate = moment(`${date.year()}-${date.month() + 1}-15`);
  } else if (+date.format("D") >= 16) {
    // const lastOfMonth = moment(`${date.year()}-${date.month()}-${date.format('D')}`);
    entry.startDate = moment(`${date.year()}-${date.month() + 1}-16`);
    entry.endDate = moment(
      `${date.year()}-${date.month() + 1}-${date.daysInMonth()}`,
    );
  }
  return entry;
}

// Get employees.
async function getEmployees() {
  try {
    const result = await db("employees");
    return result;
  } catch (error) {
    logger.error("Failed to get employees.");
    return false;
  }
}

// Get job groups.
async function getJobGroups() {
  try {
    const result = await db("job_groups");
    return result;
  } catch (error) {
    logger.error("Failed to get job groups.");
    return false;
  }
}

// Get time reports.
async function getTimeReports() {
  try {
    const result = await db("time_reports");
    return result;
  } catch (error) {
    logger.error("Failed to get time reports.");
    return false;
  }
}

// Insert time report.
async function insertTimeReport(timeReportPublicId) {
  try {
    const results = db("time_reports")
      .insert({
        public_id: timeReportPublicId,
        status: "processing",
      })
      .returning("*");
    return results;
  } catch (error) {
    logger.error(
      `Failed to insert time report with ID: ${timeReportPublicId}.`,
    );
    return false;
  }
}

// Get time report IDs.
async function getTimeReportIds(timeReportPublicId) {
  try {
    const result = await db.select("public_id").from("time_reports");
    return result;
  } catch (error) {
    logger.error(
      `Failed to insert time report with ID: ${timeReportPublicId}.`,
    );
    return false;
  }
}

// Mark time report as successfully processed.
async function successTimeReportProcessing(timeReportPublicId) {
  try {
    const result = await db("time_reports")
      .where({ public_id: timeReportPublicId })
      .update({
        status: "successful",
      })
      .returning("*");
    console.log(result);
    logger.info(
      `Successfully marked time report processing as successful: ${timeReportPublicId}.`,
    );
    return result;
  } catch (error) {
    logger.error(
      `Failed to mark time report processing as successful: ${timeReportPublicId}.`,
    );
    return false;
  }
}

// Mark time report as failed to process.
async function failTimeReportProcessing(timeReportPublicId) {
  try {
    const result = await db("time_reports")
      .where({ public_id: timeReportPublicId })
      .update({
        status: "failed",
      })
      .returning("*");
    logger.info(
      `Successfully marked time report processing as failed: ${timeReportPublicId}.`,
    );
    return result;
    return true;
  } catch (error) {
    logger.error(
      `Failed to mark time report processing as failed: ${timeReportPublicId}.`,
    );
    return false;
  }
}

// Insert missing employees.
async function insertMissingEmployees(entries) {
  try {
    entries.forEach((entry) => {
      db("employees")
        .insert({
          public_id: entry.publicId,
        })
        .then(() => {})
        .catch((error) => {
          logger.debug(`Already inserted employee ${entry.publicId}.`);
        });
    });
    const employees = await getEmployees();
    logger.info(`Inserted new employees.`);
    return employees;
  } catch (error) {
    logger.error(`Failed to insert new employee with ID: ${entry.employeeId}`);
    return false;
  }
}

// Insert time report.
async function insertTimeReportEntries(timeReportPublicId, entries) {
  try {
    const timeReports = await timeReports();
    const employees = await getEmployees();
    const jobGroups = await getJobGroups();
    entries.forEach((entry) => {
      // Join time report IDs.
      entry.jobGroupId = employees.find(
        ({ id }) => timeReportPublicId === entry.jobGroup,
      );
      // Join employee IDs.
      entry.employeeId = employees.find(
        ({ id }) => timeReportPublicId === entry.employeedId,
      );
      // Join job group IDs.
      entry.jobGroupId = jobGroups.find(
        ({ id }) => timeReportPublicId === entry.jobGroup,
      );
      entry.jobGroupHourlyPay = jobGroups.find(
        ({ hourly_pay }) => timeReportPublicId === entry.jobGroup,
      );
      // Calculate pay periods - correctly handles leap years.
      const date = getPayPeriod(entry.workDate);
      db("payroll").insert({
        employee_id: entry.employeeId,
        time_report_id: entry.jobGroupId,
        job_group_id: entry.jobGroupId,
        hours_worked: entry.hoursWorked,
        pay_amount: entry.hoursWorked * entry.jobGroupHourlyPay,
        work_date: entry.workDate,
        pay_period_start_date: date.startDate,
        pay_period_end_date: date.endDate,
      });
    });
    logger.info(
      `Inserted ${entries.length} time report entries into payroll with time report: ${timeReportPublicId}.`,
    );
  } catch (error) {
    logger.error(
      `Failed to insert time report entries with ID: ${entry.timeReportPublicId}.`,
    );
  }
}

// Get payroll report for all employees, all time.
async function getPayrollReport() {
  try {
    const payrollResults = await db("payroll")
      .select(
        "employees.public_id as employeeId",
        "payroll.pay_period_start_date as startDate",
        "payroll.pay_period_end_date as endDate",
      )
      .sum("payroll.pay_amount as amountPaid")
      .leftJoin("employees", "payroll.employee_id", "=", "employees.id")
      .leftJoin("job_groups", "payroll.job_group_id", "=", "job_groups.id")
      .orderBy("payroll.employee_id", "payroll.pay_period_start_date", "asc")
      .groupBy(
        "employees.public_id",
        "payroll.employee_id",
        "payroll.pay_period_start_date",
        "payroll.pay_period_end_date",
      );

    // Build payroll report response.
    let payrollReport = { employeeReports: [] };
    payrollResults.forEach((result) => {
      payrollReport.employeeReports.push({
        employeeId: result.employeeId,
        payPeriod: {
          startDate: result.startDate,
          endDate: result.endDate,
        },
        amountPaid: "$" + result.amountPaid,
      });
    });
    console.log(payrollReport);
    return payrollReport;
  } catch (error) {
    throw new Error(error);
    //logger.error("Failed to get employees.");
    //return false;
  }
}

module.exports = {
  zeroPad,
  getPayPeriod,
  getEmployees,
  getJobGroups,
  insertTimeReport,
  insertTimeReportEntries,
  getTimeReportIds,
  successTimeReportProcessing,
  failTimeReportProcessing,
  insertMissingEmployees,
  getPayrollReport,
};
