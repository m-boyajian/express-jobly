"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    companyHandle: "c1",
    title: "test job",
    salary: 1000000,
    equity: "0.6", 
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "j1",
        salary: 10000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: jobIds[1],
        title: "j2",
        salary: 20000,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        id: jobIds[2],
        title: "j3",
        salary: 30000,
        equity: "0.3",
        companyHandle: "c1",
      },
      {
        id: jobIds[3],
        title: "j4",
        salary: 40000,
        equity: "0.4",
        companyHandle: "c1",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(jobIds[0]); 
    expect(job).toEqual({
      id: jobIds[0],
      title: "j1", 
      salary: 10000,
      equity: '0.1',
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(9999); 
      fail("Expected NotFoundError but got success");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No job: 9999");
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
      title: "New",
      salary: 500,
      equity: "0.5",
  };

  test("works", async function () {  
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: jobIds[0],
      ...updateData,
      companyHandle: "c1",
    });
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

  // Add more test cases as needed


/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id = $1",
      [jobIds[0]]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
