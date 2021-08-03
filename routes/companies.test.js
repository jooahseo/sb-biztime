process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { testingDB } = require("./test_db");

beforeEach(testingDB);

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list of companies", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [
        { code: "apple", name: "Apple", description: "Maker of OSX" },
        {
          code: "tesla",
          name: "Tesla",
          description: "Maker of electronic car",
        },
      ],
    });
  });
});

describe("GET /companies/:code", () => {
  test("Get a detail of a company with a specific code", async () => {
    const res = await request(app).get("/companies/apple");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: "apple",
        name: "Apple",
        description: "Maker of OSX",
        invoices: [1, 2],
      },
    });
  });
  test("Respond with 404 for invalid company code", async () => {
    const res = await request(app).get("/companies/djkflskjf");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("POST a company", async () => {
    const res = await request(app).post("/companies").send({
      code: "google",
      name: "Google",
      description: "Top search engine",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "google",
        name: "Google",
        description: "Top search engine",
      },
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Update a company's info", async () => {
    const res = await request(app).put("/companies/tesla").send({
      name: "Tesla",
      description: "Electric King",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: "tesla",
        name: "Tesla",
        description: "Electric King",
      },
    });
  });
  test("Respond with 404 for invalid company code", async () => {
    const res = await request(app).put("/companies/teslalala").send({
      name: "Tesla",
      description: "Electric King",
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
    test("Delete a company", async () => {
      const res = await request(app).delete("/companies/tesla");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: "deleted"
      });
    });
    test("Respond with 404 for invalid company code", async () => {
      const res = await request(app).delete("/companies/teslalala");
      expect(res.statusCode).toBe(404);
    });
  });