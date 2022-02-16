require('dotenv').config();
const { Pool } = require('pg')
const { promisify } = require("util")
const pool = new Pool()
const query = promisify(pool.query).bind(pool)
const utils = require("./utils")

// ========== VERIFY ==========
const PARTITION_SIZE = 100000

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

      console.log("inserting tx of height: ", height);

      let partitionId = Math.floor(height/PARTITION_SIZE)
      let partitionTable = `transaction_new_${partitionId}`
      if (existTxPartition[partitionTable] != true){
          console.log("create partition table if not exists: ", partitionTable);
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
      for(let messages of MessagesArray) {
          await insertMessages(messages[0], messages[1], messages[2], messages[3])
      }
  }
  
  async function insertMessages(messagesArray, hash, height, partitionId) {
    console.log("inserting msg of height: ", height);

    // Prepare stmt
    let stmt = `INSERT INTO message_new 
    (transaction_hash, index, type, value, involved_accounts_addresses, partition_id, height) 
    VALUES `
    const cols = 7
    
    for (let i in messagesArray) {
      stmt += "("
      let start = i * cols + 1
      let end = start + cols
      for (let j = start; j < end; j++) {
        stmt += `$${j},`
      }
      stmt = stmt.slice(0, -1) // remove trailing
      stmt += "),"
    }
    stmt = stmt.slice(0, -1) // remove trailing
  
    // Partition
    let partitionTable = `message_new_${partitionId}`
    if (existMsgPartition[partitionTable] != true) {
        console.log("create partition table if not exists: ", partitionTable);
        await query(`CREATE TABLE IF NOT EXISTS ${partitionTable} PARTITION OF message_new FOR VALUES IN (${partitionId})`)
        existMsgPartition[partitionTable] = true
    }
  
    // Prepare params
    let params = []
    for(let i in messagesArray) {
        let msg = messagesArray[i]
        let type = msg["@type"].substring(1) // remove "/" from the start
      let involvedAddresses = utils.messageParser(msg)
  
      delete msg["@type"]
      params = params.concat(
        [hash, i, type, JSON.stringify(msg), involvedAddresses, partitionId, height]
      )
    }
  
    // Insert messages
    await query(stmt, params)
  }

  module.exports = {
      Transactions,
  }