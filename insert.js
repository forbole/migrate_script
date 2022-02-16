require('dotenv').config();
const { Pool } = require('pg')
const { promisify } = require("util")
const pool = new Pool()
const query = promisify(pool.query).bind(pool)
const utils = require("./utils")

// ========== MUST MODIFY ==========
const PARTITION_SIZE = 0


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
    for (let row of txRows) {
      let {
        hash, height, success, messages, memo, signatures, 
        signer_infos, fee, gas_wanted, gas_used, raw_log, logs
      } = row
  
      let partitionId = Math.ceil(height/PARTITION_SIZE)
      await query(`CREATE TABLE IF NOT EXISTS transaction_${partitionId} PARTITION OF transaction FOR VALUES IN (${partitionId})`)
  
      let sigs = ""
      signatures.forEach(el => sigs += el + ",")
      sigs = `{${sigs.slice(0, -1)}}`
  
      params = params.concat(
        [hash, height, success, JSON.stringify(messages), memo, sigs, JSON.stringify(signer_infos), 
        fee, gas_wanted, gas_used, raw_log, JSON.stringify(logs), partitionId]
        )
  
      // Insert messages of this transaction_hash
      await insertMessages(messages, hash, height)
      
    }
  
    // Insert transaction
    await query(stmt, params)
  }
  
  async function insertMessages(messagesArray, hash, height) {
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
    let partitionId = Math.ceil(height/PARTITION_SIZE)
    await query(`CREATE TABLE IF NOT EXISTS message_${partitionId} PARTITION OF message FOR VALUES IN (${partitionId})`)
  
    // Prepare params
    let params = []
    for(let i in messagesArray) {
      let msg = messagesArray[i]
      let type = msg.type.substring(1) // remove "/"
      let involvedAddresses = utils.messageParser(msg)
  
      params = params.concat(
        [hash, i, type, JSON.stringify(msg.value), involvedAddresses, partitionId, height]
      )
    }
  
    // Insert messages
    await query(stmt, params)
  }

  module.exports = {
      Transactions,
  }