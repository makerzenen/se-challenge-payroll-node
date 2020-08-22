const chai = require("chai"),
  sinon = require("sinon"),
  request = require("supertest");
const router = require("../routes.js"),
  app = require("../index.js");

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
