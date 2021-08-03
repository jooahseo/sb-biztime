const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

async function combineCompanies(industries) {
  const indResult = industries.map(async (ind) => {
    const compResult = await db.query(
      `SELECT c.code FROM companies AS c
            JOIN industry_company AS ic
            ON ic.comp_code = c.code
            WHERE ic.ind_code = $1`,
      [ind.code]
    );
    const companies = compResult.rows.map((val) => val.code);
    const ind_comp_res = {
      code: ind.code,
      industry: ind.industry,
      companies: companies,
    };
    return ind_comp_res;
  });
  return indResult;
}

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT code, industry 
            FROM industries`
    );
    const indCompPromises = await combineCompanies(result.rows);

    const finalResult = await Promise.all(indCompPromises);
    console.log("finalResult", finalResult);
    return res.json({
      industries: finalResult,
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    if (!code || !industry)
      throw new ExpressError("code and industry are required", 400);

    const result = await db.query(
      `INSERT INTO industries
            VALUES ($1, $2)
            RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (e) {
      return next(e);
  }
});

router.post("/associate", async (req, res, next)=>{
    try{
        const {ind_code, comp_code} = req.body;
        if(!ind_code || !comp_code) throw new ExpressError("ind_code and comp_code are required", 400);
        const result = await db.query(
            `INSERT INTO industry_company
            VALUES ($1,$2)
            RETURNING ind_code, comp_code`,
            [ind_code, comp_code]
        )
        return res.status(201).json({association: result.rows[0]})
    }catch(e){
        return next(e);
    }
});
module.exports = router;
