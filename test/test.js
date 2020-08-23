const chai = require("chai"),
  sinon = require("sinon"),
  request = require("supertest"),
  moment = require("moment");
const app = require("../index.js"),
  router = require("../routes.js"),
  queries = require("../queries.js"),
  logger = require("../logger");

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
/*

describe("GET /payroll-report", () => {
  it("should respond with the payroll report", () => {
    request(app)
      .get("/payroll-report")
      .expect("Content-Type", /json/)
      .expect(200, { payrollReport: {} })
      .end((err, res) => {
        if (err) throw err;
      });
  });
});

describe("POST /time-report-upload @file", () => {
  const filename = "time-report-42.csv";
  it("should respond with a successful payroll file upload", () => {
    request(app)
      .post("/payroll-upload")
      .attach("file", `${process.cwd()}/test/data/${filename}`)
      .expect("Content-Type", /json/)
      .expect(200, { message: "File uploaded and processed successfully." })
      .end((err, res) => {
        if (err) throw err;
      });
  });
});
*/

describe("queries.zeroPad() adds the correct amount of padding", () => {
  it("should append the correct amount of padding", () => {
    const numbers = [
      { number: 5, places: 2, expected: "05" },
      { number: 10, places: 2, expected: "10" },
      { number: 10, places: 3, expected: "010" },
      { number: 3000, places: 10, expected: "0000003000" },
    ];
    numbers.forEach(entry => {
      let result = queries.zeroPad(entry.number, entry.places);
      chai.expect(result).to.equal(entry.expected);
    })
  });
});

describe("queries.getPayPeriod() returns correct pay period start and end dates", () => {
  it("should validate pay period start and end dates", () => {
    const dates = [
      { date: "14/12/2001", expectedStart: "1/12/2001", expectedEnd: "15/12/2001" },
      { date: "4/5/2002", expectedStart: "1/5/2002", expectedEnd: "15/5/2002" },
      { date: "27/2/2016", expectedStart: "16/2/2016", expectedEnd: "29/2/2016" },
      { date: "29/2/2020", expectedStart: "16/2/2020", expectedEnd: "29/2/2020" },
    ];
    dates.forEach(entry => {
      let result = queries.getPayPeriod(entry.date);
      let startDateParts = entry.expectedStart.split("/");
      entry.expectedStart = moment(`${startDateParts[2]}-${queries.zeroPad(startDateParts[1], 2)}-${queries.zeroPad(startDateParts[0], 2)}`);
      let endDateParts = entry.expectedEnd.split("/");
      entry.expectedEnd = moment(`${endDateParts[2]}-${queries.zeroPad(endDateParts[1], 2)}-${queries.zeroPad(endDateParts[0], 2)}`);
      chai.expect(result.startDate.format("YYYY-MM-DD")).to.equal(entry.expectedStart.format("YYYY-MM-DD"));
      chai.expect(result.endDate.format("YYYY-MM-DD")).to.equal(entry.expectedEnd.format("YYYY-MM-DD"));
    });
  })
});
