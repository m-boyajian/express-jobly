"use strict";

const { sqlForPartialUpdate } = require("../helpers/sql");

describe('sqlForPartialUpdate', () => {
  test('works with non-empty data and jsToSql mapping', function () {
    const result = sqlForPartialUpdate(
      { firstName: 'John' },
      { firstName: 'first_name' },
    );
    expect(result).toEqual({
      setCols: '"first_name"=$1',
      values: ['John'],
    });
  });

  test('works with a single property and mapping', function () {
    const result = sqlForPartialUpdate(
      { isAdmin: 't' },
      { isAdmin: 'is_admin' }
    );

    expect(result).toEqual({
      setCols: '"is_admin"=$1',
      values: ['t'],
    });
  });
});