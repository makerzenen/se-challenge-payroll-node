if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// Module imports.
const http = require("http"),
  path = require("path"),
  methods = require("methods"),
  express = require("express"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  errorhandler = require("errorhandler"),
  pino = require("pino"),
  expressPino = require("express-pino-logger"),
  fileUpload = require("express-fileupload");

// Local imports.
const routes = require("./routes.js");

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const expressLogger = expressPino({ logger });

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require("method-override")());
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "conduit",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(fileUpload());
app.use("/", routes);

// Error handling.
if (!isProduction) {
  app.use(errorhandler());
}

app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

if (!isProduction) {
  app.use(function (err, req, res, next) {
    logger.error(err.stack);

    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

// Connect to database.
require("./knexfile");

// Add API routes.


// Start server.
const server = app.listen(process.env.PORT, () => {
  logger.info(`Server is listening on port ${server.address().port}`);
});
