const {query} = require("./psql")
const utils = require("./utils")
const App = require("../app")

const existTxPartition = {}
const existMsgPartition = {}

async function Transactions(txRows) {
  // Prepare stmt
  let stmt = `INSERT INTO transaction_new 
    (hash, height, success, messages, memo, signatures, signer_infos, fee, gas_wanted, gas_used, raw_log, logs, partition_id) 
    VALUES `
  const cols = 13
  for (let i in txRows) {
    stmt += "("
    let start = i * cols + 1
    let end = start + cols
    for (let j = start; j< end; j++) {
      stmt += `$${j},`
    }
    stmt = stmt.slice(0, -1) // remove trailing
    stmt += "),"
  }
  stmt = stmt.slice(0, -1) // remove trailing
  
  // Prepare params
  let params = []
  let forMessages = []

  for (let row of txRows) {
    let {
      hash, height, success, messages, memo, signatures, 
      signer_infos, fee, gas_wanted, gas_used, raw_log, logs
    } = row

    let partitionId = Math.floor(height/App.PARTITION_SIZE)
    let partitionTable = `transaction_new_${partitionId}`
    if (existTxPartition[partitionTable] != true){
      console.log("create partition table: ", partitionTable);
      await query(`CREATE TABLE IF NOT EXISTS ${partitionTable} PARTITION OF transaction_new FOR VALUES IN (${partitionId})`)

      existTxPartition[partitionTable] = true
    }
  
    let sigs = ""
    signatures.forEach(el => sigs += el + ",")
    sigs = `{${sigs.slice(0, -1)}}`
  
    params = params.concat(
      [hash, height, success, JSON.stringify(messages), memo, sigs, JSON.stringify(signer_infos), 
        fee, gas_wanted, gas_used, raw_log, JSON.stringify(logs), partitionId]
    )
  
    // Prepare messages of relative transaction_hash
    forMessages.push([messages, hash, height, partitionId])
  }
  
  // Insert transaction
  await query(stmt, params)
  await insertMessagesArray(forMessages)
}

async function insertMessagesArray(MessagesArray) {

  // Prepare stmt
  let stmt = `INSERT INTO message_new 
    (transaction_hash, index, type, value, involved_accounts_addresses, partition_id, height) 
    VALUES `
  const cols = 7
    
  let params = []
  let msgNumberCounter = 0
  for (let i in MessagesArray) {
    let messages = MessagesArray[i][0]
    let hash = MessagesArray[i][1]
    let height = MessagesArray[i][2]
    let partitionId = MessagesArray[i][3]

    // Create msg partition tables
    let partitionTable = `message_new_${MessagesArray[i][3]}`
    if (existMsgPartition[partitionTable] != true) {
      console.log("create partition table: ", partitionTable);
      await query(`CREATE TABLE IF NOT EXISTS ${partitionTable} PARTITION OF message_new FOR VALUES IN (${MessagesArray[i][3]})`)
      existMsgPartition[partitionTable] = true
    }

    for (let j in messages) {
      // for stmt
      let start = msgNumberCounter * cols + 1
      let end = start + cols
      stmt += "("
      for(let k = start; k < end; k++) {
        stmt += `$${k},`
      }
      stmt = stmt.slice(0, -1) // remove trailing
      msgNumberCounter += 1

      // for params
      let msg = messages[j]
      let type = msg["@type"].substring(1) // remove "/" from the start
      let involvedAddresses = utils.messageParser(msg)

      delete msg["@type"]
      params = params.concat([hash, j, type, msg, involvedAddresses, partitionId, height])
      stmt += "),"
    }
  }
  stmt = stmt.slice(0, -1) // remove trailing
  await query(stmt, params)
}

module.exports = {
  Transactions,
}