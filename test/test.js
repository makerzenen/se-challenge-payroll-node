const chai = require("chai"),
  sinon = require("sinon"),
  request = require("supertest"),
  moment = require("moment");
const app = require("../index.js"),
  routes = require("../routes.js"),
  queries = require("../queries.js"),
  logger = require("../logger"),
  knex = require("../knexfile.js"),
  db = require("knex")(knex);

// Ensures the test suite is working.
describe("baseline test", () => {
  it("ensures test suite runs", () => {
    chai.expect(true).to.be.true;
  });
});

// Test all routes.
describe("GET /", () => {
  it("should respond with welcome", () => {
    request(app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200, { message: "welcome" })
      .end((err, res) => {
        if (err) throw err;
      });
  });
});

describe("GET /ping", () => {
  it("should respond with ping", () => {
    request(app)
      .get("/ping")
      .expect("Content-Type", /json/)
      .expect(200, { message: "ping" })
      .end((err, res) => {
        if (err) throw err;
      });
  });
});

describe("POST /time-report-upload @file", () => {
  const filename = "time-report-42.csv";
  it("should respond with a successful payroll file upload", () => {
    request(app)
      .post("/time-report-upload")
      .attach("file", `${process.cwd()}/test/data/${filename}`)
      .expect("Content-Type", /json/)
      .expect(200, { message: "File uploaded and processed successfully." })
      .end((err, res) => {
        if (err) throw err;
      });
  });
});

describe("GET /payroll-report", () => {
  it("should respond with the payroll report", () => {
    request(app)
      .get("/payroll-report")
      .expect("Content-Type", /json/)
      .expect(200, { payrollReport: { employeeReports: [] } })
      .end((err, res) => {
        if (err) throw err;
      });
  });
});

// Test all queries and methods.
describe("queries.zeroPad() adds the correct amount of padding", () => {
  it("should append the correct amount of padding", () => {
    const numbers = [
      { number: 5, places: 2, expected: "05" },
      { number: 10, places: 2, expected: "10" },
      { number: 10, places: 3, expected: "010" },
      { number: 3000, places: 10, expected: "0000003000" },
    ];
    numbers.forEach((entry) => {
      let result = queries.zeroPad(entry.number, entry.places);
      chai.expect(result).to.equal(entry.expected);
    });
  });
});

describe("queries.getPayPeriod() returns correct pay period start and end dates", () => {
  it("should validate pay period start and end dates", () => {
    const dates = [
      {
        date: "14/12/2001",
        expectedStart: "1/12/2001",
        expectedEnd: "15/12/2001",
      },
      { date: "4/5/2002", expectedStart: "1/5/2002", expectedEnd: "15/5/2002" },
      {
        date: "27/2/2016",
        expectedStart: "16/2/2016",
        expectedEnd: "29/2/2016",
      },
      {
        date: "29/2/2020",
        expectedStart: "16/2/2020",
        expectedEnd: "29/2/2020",
      },
    ];
    dates.forEach((entry) => {
      let result = queries.getPayPeriod(entry.date);
      let startDateParts = entry.expectedStart.split("/");
      entry.expectedStart = moment(
        `${startDateParts[2]}-${queries.zeroPad(
          startDateParts[1],
          2,
        )}-${queries.zeroPad(startDateParts[0], 2)}`,
      );
      let endDateParts = entry.expectedEnd.split("/");
      entry.expectedEnd = moment(
        `${endDateParts[2]}-${queries.zeroPad(
          endDateParts[1],
          2,
        )}-${queries.zeroPad(endDateParts[0], 2)}`,
      );
      chai
        .expect(result.startDate.format("YYYY-MM-DD"))
        .to.equal(entry.expectedStart.format("YYYY-MM-DD"));
      chai
        .expect(result.endDate.format("YYYY-MM-DD"))
        .to.equal(entry.expectedEnd.format("YYYY-MM-DD"));
    });
  });
});

describe("queries.getEmployees()", () => {
  it("should get all employees", async () => {
    const employees = [
      { publicId: 1 },
      { publicId: 2 },
      { publicId: 3 },
      { publicId: 4 },
      { publicId: 5 },
    ];
    const results = await queries.insertMissingEmployees(employees);
    chai.expect(results.length).to.equal(employees.length);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.getJobGroups()", () => {
  it("should get all job groups", async () => {
    const results = await queries.getJobGroups();
    chai.expect(results.length).to.equal(2);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.getTimeReports()", () => {
  it("should get all time reports", async () => {
    const filename = "time-report-100000.csv";
    const publicId = routes.parseTimeReportId(filename);
    const results = await queries.insertTimeReport(publicId);
    chai.expect(results.length).to.equal(1);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.insertTimeReport()", () => {
  it("should insert time report", async () => {
    const filename = "time-report-42.csv";
    const publicId = routes.parseTimeReportId(filename);
    const results = await queries.insertTimeReport(publicId);
    chai.expect(results.length).to.equal(1);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.insertTimeReportEntries()", () => {
  it("should insert all time report entries", async () => {
    const filename = "time-report-42.csv";
    const filepath = "./data/time-report-42.csv";
    const timeReportPublicId = routes.parseTimeReportId(filename);
    const timeReports = await queries.insertTimeReport(timeReportPublicId);
    const employees = [
      { publicId: 1 },
      { publicId: 2 },
      { publicId: 3 },
      { publicId: 4 },
      { publicId: 5 },
    ];
    const employeeResults = await queries.insertMissingEmployees(employees);
    // Parse CSV rows.
    const results = routes.parseTimeReportCsv(
      timeReportPublicId,
      `${process.cwd()}/test/data/${filename}`,
    );
    results.then(async (entries) => {
      try {
        const timeReportEntries = await queries.insertTimeReportEntries(
          timeReportPublicId,
          entries,
        );
        // Mark time report as successful.
        await queries.successTimeReportProcessing(timeReportPublicId);
      } catch (error) {
        await queries.failTimeReportProcessing(timeReportPublicId);
      }
    });
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.successTimeReportProcessing()", () => {
  it("should mark time report as successfully processed", async () => {
    const filename = "time-report-42.csv";
    const publicId = routes.parseTimeReportId(filename);
    await queries.insertTimeReport(publicId);
    const results = await queries.successTimeReportProcessing(publicId);
    chai.expect(results[0].public_id).to.equal(42);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.failTimeReportProcessing()", () => {
  it("should mark time report as failed", async () => {
    const filename = "time-report-42.csv";
    const publicId = routes.parseTimeReportId(filename);
    await queries.insertTimeReport(publicId);
    const results = await queries.failTimeReportProcessing(publicId);
    chai.expect(results[0].public_id).to.equal(42);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.insertMissingEmployees()", () => {
  it("should insert missing employees", async () => {
    const employees = [
      { publicId: 1 },
      { publicId: 2 },
      { publicId: 3 },
      { publicId: 4 },
      { publicId: 5 },
    ];
    const results = await queries.insertMissingEmployees(employees);
    chai.expect(results.length).to.equal(employees.length);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});

describe("queries.getPayrollReport()", () => {
  it("should get payroll report", async () => {
    const filename = "time-report-42.csv";
    const filepath = "./data/time-report-42.csv";
    const timeReportPublicId = routes.parseTimeReportId(filename);
    const timeReports = await queries.insertTimeReport(timeReportPublicId);
    const employees = [
      { publicId: 1 },
      { publicId: 2 },
      { publicId: 3 },
      { publicId: 4 },
      { publicId: 5 },
    ];
    const employeeResults = await queries.insertMissingEmployees(employees);
    // Parse CSV rows.
    const results = routes.parseTimeReportCsv(
      timeReportPublicId,
      `${process.cwd()}/test/data/${filename}`,
    );
    results.then(async (entries) => {
      try {
        const timeReportEntries = await queries.insertTimeReportEntries(
          timeReportPublicId,
          entries,
        );
        // Mark time report as successful.
        await queries.successTimeReportProcessing(timeReportPublicId);
      } catch (error) {
        await queries.failTimeReportProcessing(timeReportPublicId);
      }
    });
    const payrollReport = await queries.getPayrollReport();
    logger.info(`Payroll Report: ${payrollReport}`);
  });
  beforeEach(() => {
    return db.migrate.latest().then(() => {
      return db.seed
        .run()
        .then(() => {})
        .catch((error) => {});
    });
  });
  afterEach(() => {
    return db.migrate.rollback();
  });
});
