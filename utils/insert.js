const {query} = require("./psql")
const utils = require("./utils")

const existTxPartition = {}
const existMsgPartition = {}

async function Transactions(txRows) {
  if (txRows.length == 0) {
    return
  } 

  let {PARTITION_SIZE} = process.env
  PARTITION_SIZE = parseInt(PARTITION_SIZE)

  // // Prepare stmt
  // let stmt = `INSERT INTO transaction 
  //   (hash, height, success, messages, memo, signatures, signer_infos, fee, gas_wanted, gas_used, raw_log, logs, partition_id) 
  //   VALUES `
  // const cols = 13
  // for (let i in txRows) {
  //   stmt += "("
  //   let start = i * cols + 1
  //   let end = start + cols
  //   for (let j = start; j< end; j++) {
  //     stmt += `$${j},`
  //   }
  //   stmt = stmt.slice(0, -1) // remove trailing
  //   stmt += "),"
  // }
  // stmt = stmt.slice(0, -1) // remove trailing
  
  // Prepare params
  let params = []
  let forMessages = []

  for (let row of txRows) {
    let {
      hash, height, success, messages, memo, signatures, 
      signer_infos, fee, gas_wanted, gas_used, raw_log, logs
    } = row

    let partitionId = Math.floor(height/PARTITION_SIZE)
    // let partitionTable = `transaction_${partitionId}`
    // if (existTxPartition[partitionTable] != true){
    //   console.log("CREATE PARTITION TABLE ", partitionTable);
    //   await query(`CREATE TABLE IF NOT EXISTS ${partitionTable} PARTITION OF transaction FOR VALUES IN (${partitionId})`)
    //   existTxPartition[partitionTable] = true
    // }
  
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
  
  // stmt += 'ON CONFLICT DO NOTHING'
  // Insert transaction
  // await query(stmt, params)
  await insertMessagesArray(forMessages)
}

async function insertMessagesArray(MessagesArray) {

  // Prepare stmt
  let stmt = `INSERT INTO message_backup_new 
    (transaction_hash, index, type, value, involved_accounts_addresses, partition_id, height) 
    VALUES `
  const cols = 7
    
  let params = []
  let msgNumberCounter = 0
  for (let i in MessagesArray) {
    let [ messages, hash, height, partitionId ] = MessagesArray[i]

    // Create msg partition tables
    let partitionTable = `message_backup_new_${partitionId}`
    if (existMsgPartition[partitionTable] != true) {
      console.log("CREATE PARTITION TABLE ", partitionTable);
      await query(`CREATE TABLE IF NOT EXISTS ${partitionTable} PARTITION OF message_backup_new FOR VALUES IN (${partitionId})`)
      existMsgPartition[partitionTable] = true
    }

    for (let index in messages) {
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
      let msg = messages[index]
      let type = msg["@type"].substring(1) // remove "/" from the start
      let involvedAddresses = utils.messageParser(msg)

      delete msg["@type"]
      params = params.concat([hash, index, type, msg, involvedAddresses, partitionId, height])
      stmt += "),"
    }
  }
  stmt = stmt.slice(0, -1) // remove trailing
  stmt += 'ON CONFLICT DO NOTHING'
  await query(stmt, params)
}

module.exports = {
  Transactions,
}