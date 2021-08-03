process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const { testingDB } = require("./test_db");
const db = require("../db");

beforeEach(testingDB);

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("Get a list of invoices", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /invoices/:id", () => {
  test("Get an invoice with id", async () => {
    const res = await request(app).get("/invoices/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "apple",
        amt: 100,
        paid: false,
        add_date: "2021-01-03T05:00:00.000Z",
        paid_date: null,
      },
    });
  });
  test("Respond with 404 for invalid id", async () => {
    const res = await request(app).get("/invoices/0");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
  test("post an invoice", async () => {
    const res = await request(app).post("/invoices").send({
      comp_code: "apple",
      amt: 500,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        id: 4,
        comp_code: "apple",
        amt: 500,
        paid: false,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });
});

describe("PUT /invoices/:id", () => {
  test("update an invoice", async () => {
    const res = await request(app).put("/invoices/3").send({
      amt: 1500,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        id: 3,
        comp_code: "tesla",
        amt: 1500,
        paid: false,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });
  test("Respond with 404 for invalid invoice id", async () => {
    const res = await request(app).put("/invoices/999").send({
      amt: 1500,
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /invoices/:id", () => {
  test("Delete an invoice", async () => {
    const res = await request(app).delete("/invoices/3");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "deleted",
    });
  });
  test("Respond with 404 for invalid invoice id", async () => {
    const res = await request(app).delete("/invoices/999");
    expect(res.statusCode).toBe(404);
  });
});
