const knex = require("./knexfile.js"),
  db = require("knex")(knex);
const logger = require("./logger.js");

// Get employees.
async function getEmployees() {
  const result = await db("employees");
  return result;
}

// Get job groups.
async function getJobGroups() {
  const result = await db("job_groups");
  return result;
}

// Insert time report.
async function insertTimeReport(timeReportPublicId) {
  db("time_reports").insert({
    public_id: timeReportPublicId,
    status: "processing",
  });
}

// Get time report IDs.
async function getTimeReportIds(timeReportPublicId) {
  const result = await db.select("public_id").from("time_reports");
  return result;
}

// Mark time report as successfully processed.
async function successTimeReportProcessing(timeReportPublicId) {
  db("time_reports").where({ public_id: payrollPublicId }).update({
    status: "successful",
  });
}

// Mark time report as failed to process.
async function failTimeReportProcessing(timeReportPublicId) {
  const result = db("time_reports")
    .where({ public_id: payrollPublicId })
    .update({
      status: "failed",
    });
}

// Insert missing employees.
async function insertMissingEmployees(entries) {
  entries.forEach(async entry => {
    console.log(entry);
    db("employees").insert({
      public_id: entry.employeeId,
    });
  });
}

// Insert payroll.
async function insertTimeReportEntries(timeReportPublicId, entries) {
  const employees = await getEmployees();
  const jobGroups = await getJobGroups();
  const transaction = db.transaction();
  try {
    entries.forEach((entry) => {
      // Join employee IDs.
      entry.employeeId = employees.find(({ id }) => publicId === entry.employeedId);
      // Join job group IDs.
      entry.jobGroupId = jobGroups.find(({ id }) => publicId === entry.jobGroup);
      entry.jobGroupHourlyPay = jobGroups.find(({ hourly_pay }) => publicId === entry.jobGroup);
      // Calculate pay periods - correctly handles leap years.
      const date = new Date(result.workDate);
      if (date.getDate() <= 15) {
        entry.startDate = new Date(date.getYear(), date.getMonth() + 1, 1);
        entry.endDate = new Date(date.getYear(), date.getMonth() + 1, 15);
      } else if (date.getDate() >= 16) {
        const lastOfMonth = new Date(date.getYear(), date.getMonth(), 0)
        entry.startDate = new Date(date.getYear(), date.getMonth() + 1, 16);
        entry.endDate = new Date(date.getYear(), date.getMonth() + 1, lastOfMonth);
      }
      db("payroll")
        .transacting(transaction)
        .insert({
          employee_id: entry.employeeId,
          time_report_id: payrollPublicId,
          job_group_id: entry.jobGroupId,
          pay_period_id: entry.payPeriodId,
          hours_worked: entry.hoursWorked,
          pay_amount: entry.hoursWorked * entry.jobGroupHourlyPay,
          work_date: entry.workDate,
          pay_period_start_date: entry.startDate,
          pay_period_end_date: entry.endDate,
        });
    });
  } catch (error) {
    transaction.rollback();
  }
}

async function getPayrollReport() {
  const payrollResults = db
    .from("payroll")
    .select(
      "employees.public_id as employeeId",
      "payroll.pay_amount as payAmount",
      "payroll.work_date as workDate",
      "payroll.pay_period_start_date as startDate",
      "payroll.pay_period_end_date as endDate"
    ).sum("payroll.pay_amount as amountPaid")
    .leftJoin("employees", "payroll.employee_id", "=", "employees.id")
    .leftJoin("job_groups", "payroll.job_group_id", "=", "job_groups.id")
    .orderBy("employee_id", "pay_period_start_date", "asc")
    .groupBy("pay_period_start_date", "employee_id");

  // Build payroll report response.
  let payrollReport = { employeeReports: [] };
  payrollResults.forEach(result => {
    payrollReport.employeeReports.push({
      employeeId: result.employeeId,
      payPeriod: {
        startDate: result.startDate,
        endDate: result.endDate,
      },
      amountPaid: "$" + result.amountPaid,
    });
  });
  return payrollReport;
}

module.exports = {
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
