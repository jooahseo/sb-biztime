const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query("SELECT * FROM companies WHERE code = $1", [
      code,
    ]);
    if (!result.rows.length)
      throw new ExpressError(`Can't find the company code ${code}`, 404);

    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name)
      throw new ExpressError("code and name are required", 404);
    const result = await db.query(
      "INSERT INTO companies VALUES ($1,$2,$3) RETURNING code, name, description",
      [code, name, description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    if (!name || !description)
      throw new ExpressError("name and description are required", 404);
    const result = await db.query(
      "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
      [name, description, code]
    );

    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const getCompany = await db.query("SELECT * FROM companies WHERE code=$1", [
      code,
    ]);
    if (!getCompany.rows.length)
      throw new ExpressError(`Company ${code} is not found.`, 404);
    const result = await db.query("DELETE FROM companies WHERE code = $1", [
      code,
    ]);

    return res.send({ msg: `${code} Deleted` });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
