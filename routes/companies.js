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
    const compResult = await db.query(
      `SELECT * FROM companies 
       WHERE code = $1`,
      [code]
    );
    const invResult = await db.query(
      `SELECT * FROM invoices 
       WHERE comp_code=$1 
       ORDER BY id`,
      [code]
    );
    if (!compResult.rows.length)
      throw new ExpressError(`Can't find the company code ${code}`, 404);

    const companyInfo = compResult.rows[0];
    const invoices = invResult.rows;
    companyInfo.invoices = invoices.map((inv) => inv.id);

    return res.json({ company: companyInfo });
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
      `INSERT INTO companies 
       VALUES ($1,$2,$3) 
       RETURNING code, name, description`,
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
      `UPDATE companies SET name=$1, description=$2 
      WHERE code=$3 
      RETURNING code, name, description`,
      [name, description, code]
    );
    if (!result.rows[0])
      throw new ExpressError(`company ${code} not found`, 404);
      
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const result = await db.query(
      `DELETE FROM companies 
      WHERE code = $1
      RETURNING code`,
      [code]
    );

    if (result.rows.length === 0)
      throw new ExpressError(`Company ${code} is not found.`, 404);
    return res.send({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
