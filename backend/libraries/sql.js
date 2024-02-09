
const mysql = require('mysql');

const logAllSQLQueries = true;

/**
 * 
 * @returns Returns a new SQL connection to the database
 */

async function newSQLConnection() {
  let con = mysql.createConnection({
    host: "ktprog.com",
    user: "ktinventory",
    password: "Keefe!2024!Invent",
    database: "ktinventory"
  })
  let workingConnection = await new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.log("error: " + err.code);
        resolve(false);
      }
      else {
        resolve(true);
      }
    });
  });

  if (!workingConnection) {
    return false
  }
  return con
}
/**
 * Queries a database and returns the result. DO NOT USE OUTSIDE OF TESTING, INSTED USE getVerifiedQueryResponse, as it has protection from SQL injection
 * @param {Connection} con The Connection object to the database
 * @param {String} sql The SQL command to run
 * @returns Returns the query response from the database
 */
async function getQueryResponse(con, sql) {
  if (logAllSQLQueries) {
    console.log(sql);
  }

  return new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if (err) {
        console.log("error: " + err.code);
      }
      else {
        resolve(result);
      }
    });
  });
}
/**
 * Gets a query response given the connection, query string, and positional arguments. Prevents SQL injection.
 * @param {Connection} con the SQL connection
 * @param {String} sql the Query string
 * @param {Array} args The positional arguments to be delivered
 * @returns Results of the query
 */
async function getVerifiedQueryResponse(con, sql, args) {
  if (logAllSQLQueries) {
    console.log(sql);
  }

  return new Promise((resolve, reject) => {
    con.query(sql, args, (err, result) => {
      if (err) {
        console.log("error: " + err.code);
      }
      else {
        resolve(result);
      }
    });
  });
}
module.exports = {
  newSQLConnection,
  getQueryResponse,
  getVerifiedQueryResponse
}