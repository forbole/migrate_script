const Create = require("./utils/create")
const Alter = require("./utils/alter")
const {end} = require("./utils/psql")

async function prepareTables() {

  await Alter.oldTxTable()
  await Alter.oldMsgTable()

  await Create.NewTxTable()
  await Create.NewMsgTable()

  await end()
  
} 

return prepareTables()