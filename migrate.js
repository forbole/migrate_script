require('dotenv').config();
const Create = require("./utils/create")
const Drop = require("./utils/drop")
const Insert = require("./utils/insert")
const utils = require("./utils/utils")
const {query,end} = require("./utils/psql")

async function migrate() {
  let {BATCH, PARTITION_SIZE} = process.env
  let LIMIT = parseInt(BATCH)
  PARTITION_SIZE = parseInt(PARTITION_SIZE)

  const {rows} = await query("SELECT COUNT(*) FROM transaction_old")
  const totolRowCount = rows[0].count
 
  console.log(`Total count of rows: ${totolRowCount}`);
  console.log(`Migrating ${LIMIT} rows per batch`);
  console.log(`Partition size set to ${PARTITION_SIZE}\n`);

  let offset = 0
  // Handle in batch
  while(true) {
    // Select rows from original transaction_old table
    const txRows = await utils.selectFromOldTxTable(LIMIT, offset)
    if (txRows.length == 0) {
      break
    }

    // Insert into new tables
    console.log(`handling from row ${offset} to ${offset + LIMIT}`)
    await Insert.Transactions(txRows)

    offset += LIMIT
  }
  await Drop.DropMessageByAddressFunc()
  await Create.NewMessageByAddressFunc()
  await end()
  console.log("Migration done");
} 

return migrate()