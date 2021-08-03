process.env.NODE_ENV = "test";

const db = require("../db");

async function testingDB() {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("SELECT setval('invoices_id_seq', 1, false)");

  await db.query(`INSERT INTO companies 
    VALUES ('apple','Apple', 'Maker of OSX'),
           ('tesla','Tesla','Maker of electronic car')`);

  const inv = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
    VALUES ('apple',100,false,'2021-01-03', null),
           ('apple',200,true,'2021-02-28', '2021-05-28'),
           ('tesla',1000,false,'2021-04-15',null)
           RETURNING id`);
}

module.exports = { testingDB };
