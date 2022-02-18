const Create = require("./utils/create")
const Alter = require("./utils/alter")
const {end} = require("./utils/psql")

async function prepareTables() {
  console.log(`--- Preparing tables ---\n`)

  await Alter.oldTxTable()
  await Alter.oldMsgTable()

  await Create.NewTxTable()
  await Create.NewMsgTable()

  await end()
  console.log(`\n--- Preparing tables completed ---\n`)

  
} 

return prepareTables()