require('dotenv').config();
const { Pool } = require('pg')
const { promisify } = require("util")
const pool = new Pool()
const promiseQuery = promisify(pool.query).bind(pool)
const promiseEnd = promisify(pool.end).bind(pool)


module.exports = {
  query: promiseQuery,
  end: promiseEnd
}