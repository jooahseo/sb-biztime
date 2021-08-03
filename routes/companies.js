const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

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
    if (!compResult.rows.length)
      throw new ExpressError(`Can't find the company code ${code}`, 404);

    const invResult = await db.query(
      `SELECT * FROM invoices 
       WHERE comp_code=$1 
       ORDER BY id`,
      [code]
    );
    const indResult = await db.query(
      `SELECT i.industry FROM industries AS i
       JOIN industry_company AS ic
       ON ic.ind_code = i.code
       JOIN companies AS c
       ON c.code = ic.comp_code
       WHERE c.code = $1`,
      [code]);

    const companyInfo = compResult.rows[0];
    const invoices = invResult.rows;
    const industries = indResult.rows;
    companyInfo.invoices = invoices.map((inv) => inv.id);
    companyInfo.industries = industries.map((ind)=> ind.industry)

    return res.json({ company: companyInfo });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) throw new ExpressError("name is required", 404);
    const code = slugify(name, { lower: true });
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
