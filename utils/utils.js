const {query} = require("./psql")
const {defaultAccountParser,customAccountParser}= require("./messageParser")

async function selectFromOldTxTable(limit, offset) {
  const result = await query(`SELECT * FROM transaction_old ORDER BY height LIMIT ${limit} OFFSET ${offset}`)
  return result.rows
}
  
function messageParser(msg) {
  const accountParsers = defaultAccountParser.concat(customAccountParser)
  console.log(accountParsers.length);

  let involvedAddresses = "{"
  for(let role of accountParsers) if (msg[role] != undefined) involvedAddresses += msg[role] + ","
  if (msg.input != undefined) msg.input.forEach(i => {involvedAddresses += i.address  + ","})
  if (msg.output != undefined) msg.output.forEach(o => {involvedAddresses += o.address  + ","})
  
  involvedAddresses = involvedAddresses.slice(0 , -1) + "}"
  
  if (involvedAddresses.length == 1) {
    // when involvedAddresses == "{"
    return "{}"
  }
  
  return involvedAddresses
}

module.exports = {
  selectFromOldTxTable,
  messageParser,
}