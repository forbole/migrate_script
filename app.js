require('dotenv').config();
const { Pool } = require('pg')
const { promisify } = require("util")
const pool = new Pool()
const query = promisify(pool.query).bind(pool)

const Create = require("./create")
const Insert = require("./insert")
const utils = require("./utils")

// ========== VERIFY ==========
const LIMIT = 500

return migrate()

async function migrate() {
    await query(`
    DROP TABLE IF EXISTS message_new;
    DROP TABLE IF EXISTS transaction_new;
    `)
    console.log("dropped tables");
    await Create.NewTxTable()
    await Create.NewMsgTable()

    const {rows} = await query("SELECT COUNT(*) FROM transaction")
    const totolRowCount = rows[0].count
 
    let stop = false
    let offset = 0
    while(stop != true) {

      const txRows = await utils.selectFromOldTxTable(LIMIT, offset)
      await Insert.Transactions(txRows)
  
      offset += LIMIT
      if (offset >= totolRowCount) {
        stop = true
      }
    }
} 

