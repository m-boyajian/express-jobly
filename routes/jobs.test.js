"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "professional doodler",
            salary: 1,
            equity: "0.7",
            company_handle: "c1"
        })
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        id: expect.any(Number),
        title: "professional doodler",
        salary: 1,
        equity: "0.7",
        company_handle: "c1",
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          salary: 25000,
          title: "the best job",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "dog walker",
        salary: 111,
        equity: "0.6",
        company_handle: "c1"
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          title: "chef",
          equity: "0.2",
          salary: "not-a-number",
          company_handle: "c1", 
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
            {
              id: jobIds[0],
              title: "j1",
              salary: 10000,
              equity: "0.1",
              company_handle: "c1",
            },
            {
              id: jobIds[1],
              title: "j2",
              salary: 20000,
              equity: "0.2",
              company_handle: "c1",
            },
            {
              id: jobIds[2],
              title: "j3",
              salary: 30000,
              equity: "0.3",
              company_handle: "c1",
            },
            {
              id: jobIds[3],
              title: "j4",
              salary: 40000,
              equity: "0.4",
              company_handle: "c1",
            },
            
      ],
    });
  });
});

/************************************** GET /jobs with filters */

describe("GET /jobs with filters", function () {
  test("works with title filter", async function () {
    const resp = await request(app).get("/jobs").query({ title: "j2" });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds[1],
          title: "j2",
          salary: 20000,
          equity: "0.2",
          company_handle: "c1",
        },
      ],
    });
  });

  test("works with minSalary filter", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 30000 });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds[2],
          title: "j3",
          salary: 30000,
          equity: "0.3",
          company_handle: "c1",
        },
        {
          id: jobIds[3],
          title: "j4",
          salary: 40000,
          equity: "0.4",
          company_handle: "c1",
        },
      ],
    });
  });

  test("works with hasEquity filter", async function () {
    const resp = await request(app).get("/jobs").query({ hasEquity: "true" });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds[0],
          title: "j1",
          salary: 10000,
          equity: "0.1",
          company_handle: "c1",
        },
        {
          id: jobIds[1],
          title: "j2",
          salary: 20000,
          equity: "0.2",
          company_handle: "c1",
        },
        {
          id: jobIds[2],
          title: "j3",
          salary: 30000,
          equity: "0.3",
          company_handle: "c1",
        },
        {
          id: jobIds[3],
          title: "j4",
          salary: 40000,
          equity: "0.4",
          company_handle: "c1",
        },
      ],
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "j2",
        salary: 20000,
        equity: "0.2",
        company_handle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "new jobby",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New jobby",
        salary: 5,
        equity: "0.4",
        company_handle: "c1",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "New jobby",
        })
        .set("authorization", `Bearer ${u1Token}`)
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          salary: 20,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/`)
        .send({
          handle: "c1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          company_handle: "c2",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: jobIds[0] });
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauthorized for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for non-admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});
