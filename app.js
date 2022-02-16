require('dotenv').config();

const { Pool } = require('pg')
const { promisify } = require("util")
const pool = new Pool()
const query = promisify(pool.query).bind(pool)

const Create = require("./create")
const Insert = require("./insert")
const utils = require("./utils")

async function migrate() {
    const {rows} = await query("SELECT COUNT(*) FROM transaction")
    const totolRowCount = rows[0].count

    await Create.NewTxTable()
    await Create.NewMsgTable()
  
    let stop = false
    const limit = 100
    let offset = 0
    while(stop != true) {
      const txRows = await utils.selectFromOldTxTable(limit, offset)
      const insertResult = await Insert.Transactions(txRows)
  
      offset += limit
      if (offset >= totolRowCount) {
        stop = true
      }
    }
} 

return migrate()