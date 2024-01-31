"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNew = require("../schemas/jobNew.json");
const jobUpdate = require("../schemas/jobUpdate.json");
const jobSearch = require("../schemas/jobSearch.json");

const router = new express.Router({ mergeParams: true });

/** POST / { job } =>  { job}
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNew);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }

      console.log("Request Body:", req.body);
  
      const job = await Job.create(req.body);
      console.log("Created Job:", job);
      return res.status(201).json({ job });
    } catch (err) {
      console.error("Error creating job:", err);
      return next(err);
    }
  });

  /** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandlel }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    try {
      const jobs = await Job.findAll();
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });

  /** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const { title, minSalary, hasEquity } = req.query || {};
    const jobs = await Job.findAll( {title, minSalary, hasEquity} );
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});
  
  /** GET /[id]  =>  { job }
   *
   *  Job is { id, title, salary, equity, companyHandle }
   *   where companies are [{ handle, name, description, numEmployees, logo_url }, ...]
   *
   * Authorization required: none
   */
  
  router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** PATCH /[id] { fld1, fld2, ... } => { job }
   *
   * Patches job data.
   *
   * fields can be: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle}
   *
   * Authorization required: admin
   */
  
  router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdate);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** DELETE /[id]  =>  { deleted: id }
   *
   * Authorization: admin
   */
  
  router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: +req.params.id });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;