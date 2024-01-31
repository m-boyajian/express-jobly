"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create({ companyHandle, title, salary, equity }) {
    console.log('Creating job with data:', { companyHandle, title, salary, equity });
    const result = await db.query(
      `INSERT INTO jobs
       (company_handle, title, salary, equity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, company_handle AS "companyHandle", title, salary, equity`,
      [companyHandle, title, salary, equity],
    );
    const job = result.rows[0];
  
    return job;
  }  

    static async findAll(title, minSalary, hasEquity) {
      let conditions = [];
      let values = [];
  
      if (title !== undefined) {
        conditions.push(`title ILIKE $${conditions.length + 1}`);
        values.push(`%${title}%`);
      }
  
      if (minSalary !== undefined) {
        conditions.push(`salary >= $${conditions.length + 1}`);
        values.push(minSalary);
      }
  
      if (hasEquity !== undefined) {
        if (hasEquity === 'true') {
          conditions.push(`equity > 0`);
        } else if (hasEquity === 'false') {
          conditions.push(`equity = 0`);
        }
      }
  
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await db.query(
        `SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
         FROM jobs
         ${whereClause}
         ORDER BY title`,
        values
      );
  
      return result.rows;
    }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: "salary",
          equity: "equity",
        });
    const idVarIdx = "$" + (values.length + 1);
    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${idVarIdx}
                      RETURNING id, 
                      title, 
                      salary, 
                      equity, 
                      company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if(!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports=Job;