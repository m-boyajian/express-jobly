# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i

## sqlForPartialUpdate

### Description
The sqlForPartialUpdate function takes 2 parameters, 'dataToUpdate' and 'jsToSql'. It creates a variable 'keys' to be an array of column names that need updating in SQL query. If no data is provided, BadRequestError is thrown (imported from expressError). Otherwise, each key is mapped to a column name.

### Parameters
- `dataToUpdate` An object containing the data to be updated. Each key-value pair represents a column and its updated value.
- `jsToSql` An optional mapping object that maps JS property names to SQL column names.

### Returns
An object with the following properties:
- `setCols` A string containing the concatenated column update strings separated by commas. 
- `values` An array containing the updated values extracted from the `dataToUpdate` object. 

