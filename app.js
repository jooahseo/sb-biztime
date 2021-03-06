/** BizTime express application. */

const express = require("express");

const app = express();
const ExpressError = require("./expressError");

app.use(express.json());

const compRoute = require("./routes/companies");
const invRoute = require("./routes/invoices");
const indRoute = require("./routes/industries");

app.use("/companies", compRoute);
app.use("/invoices", invRoute)
app.use("/industries", indRoute)
/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  
  return res.json({
    error: err,
  });
});

module.exports = app;
