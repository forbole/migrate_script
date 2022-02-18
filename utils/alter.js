const {query} = require("./psql")

// async function oldTxTable(){
//   console.log("ALTER TABLE IF EXISTS transaction RENAME TO transaction_old;")
//   console.log("ALTER INDEX IF EXISTS transaction_pkey RENAME TO transaction_old_pkey;")
//   console.log("ALTER INDEX IF EXISTS transaction_hash_index RENAME TO transaction_old_hash_index;")
//   console.log("ALTER INDEX IF EXISTS transaction_height_index RENAME TO transaction_old_height_index;")
//   console.log("ALTER TABLE IF EXISTS transaction_old RENAME CONSTRAINT transaction_height_fkey TO transaction_old_height_fkey;")

//   // Rename table
//   await query("ALTER TABLE IF EXISTS transaction RENAME TO transaction_old;")
//   // Rename index
//   await query(`
//         ALTER INDEX IF EXISTS transaction_pkey RENAME TO transaction_old_pkey;
//         ALTER INDEX IF EXISTS transaction_hash_index RENAME TO transaction_old_hash_index;
//         ALTER INDEX IF EXISTS transaction_height_index RENAME TO transaction_old_height_index;`
//   )
//   // Rename foreign key
//   await query("ALTER TABLE IF EXISTS transaction_old RENAME CONSTRAINT transaction_height_fkey TO transaction_old_height_fkey;")
// }

async function oldMsgTable(){
//   console.log("ALTER TABLE IF EXISTS message_backup RENAME TO message_backup_old;")
  // console.log("ALTER INDEX IF EXISTS message_involved_accounts_addresses RENAME TO message_old_involved_accounts_addresses;")
  // console.log("ALTER INDEX IF EXISTS message_transaction_hash_index RENAME TO message_old_transaction_hash_index;")
  // console.log("ALTER INDEX IF EXISTS message_type_index RENAME TO message_old_type_index;")
  // console.log("ALTER TABLE IF EXISTS message_old RENAME CONSTRAINT message_transaction_hash_fkey TO message_old_transaction_hash_fkey;")

  // Rename table
//   await query("ALTER TABLE IF EXISTS message_backup RENAME TO message_backup_old;")
  // Rename index
  // await query(`
  //     ALTER INDEX IF EXISTS message_involved_accounts_addresses RENAME TO message_old_involved_accounts_addresses;
  //     ALTER INDEX IF EXISTS message_transaction_hash_index RENAME TO message_old_transaction_hash_index;
  //     ALTER INDEX IF EXISTS message_type_index RENAME TO message_old_type_index;`
  // )
  // // Rename foreign key
//   await query("ALTER TABLE IF EXISTS message_old RENAME CONSTRAINT message_transaction_hash_fkey TO message_old_transaction_hash_fkey;")
}


module.exports = { 
//   oldTxTable,
  oldMsgTable,
}