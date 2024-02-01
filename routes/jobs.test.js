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

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);

    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "j1",
        salary: 50000,
        equity: "0.1",
        company: {
          handle: "c1",
          description: "Desc1",
          logoUrl: "http://c1.img",
          name: "C1",
          numEmployees: 1,
        },
      },
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
          id: expect.any(Number),
          title: "j1",
          salary: 50000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 60000,
          equity: "0.2",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 70000,
          equity: "0.3",
          companyHandle: "c1",
        },
      ],
    });
  });
});

/************************************** GET /jobs with filters */

describe("GET /jobs with filters", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 50000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 60000,
          equity: "0.2",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 70000,
          equity: "0.3",
          companyHandle: "c1",
        },
      ],
    });
  }); 

  test("works: 2 filters", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 5, hasEquity: "true" });
    const expectedJob = {
      title: "j2",
      salary: 60000,
      equity: "0.2",
      companyHandle: "c1",
    };
    expect(resp.body.jobs).toContainEqual(expect.objectContaining(expectedJob));
  });  

  test("works with hasEquity filter", async function () {
    const resp = await request(app).get(`/jobs`).query({ hasEquity: "true" });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 50000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 60000,
          equity: "0.2",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 70000,
          equity: "0.3",
          companyHandle: "c1",
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
        title: "j1",
        salary: 50000,
        equity: "0.1",
        company: {
          description: "Desc1",
          handle: "c1",
          logoUrl: "http://c1.img",
          name: "C1",
          numEmployees: 1,
        },
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
        title: "new jobby",
        salary: 50000,
        equity: "0.1",
        companyHandle: "c1",
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
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request in handle change", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          handle: "new",
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
