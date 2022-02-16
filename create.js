require('dotenv').config();
const { Pool } = require('pg')
const { promisify } = require("util")
const pool = new Pool()
const query = promisify(pool.query).bind(pool)

async function NewTxTable() {
    console.log("create new tx table\n");

    await query(`CREATE TABLE transaction_new
      (
          hash         TEXT    NOT NULL,
          height       BIGINT  NOT NULL REFERENCES block (height),
          success      BOOLEAN NOT NULL,
  
          /* Body */
          messages     JSONB   NOT NULL DEFAULT '[]'::JSONB,
          memo         TEXT,
          signatures   TEXT[]  NOT NULL,
  
          /* AuthInfo */
          signer_infos JSONB   NOT NULL DEFAULT '[]'::JSONB,
          fee          JSONB   NOT NULL DEFAULT '{}'::JSONB,
  
          /* Tx response */
          gas_wanted   BIGINT           DEFAULT 0,
          gas_used     BIGINT           DEFAULT 0,
          raw_log      TEXT,
          logs         JSONB,
  
          /* Psql partition */
          partition_id BIGINT NOT NULL,
          PRIMARY KEY(hash, partition_id)
      )PARTITION BY LIST(partition_id);
      CREATE INDEX transaction_new_hash_index ON transaction_new (hash);
      CREATE INDEX transaction_new_height_index ON transaction_new (height);
      CREATE INDEX transaction_new_partition_id_index ON transaction_new (partition_id);
      GRANT ALL PRIVILEGES ON transaction_new TO forbole;`)
  }
  
  async function NewMsgTable() {
    console.log("create new msg table\n");

    await query(`CREATE TABLE message_new
    (
          transaction_hash            TEXT   NOT NULL,
          index                       BIGINT NOT NULL,
          type                        TEXT   NOT NULL,
          value                       JSONB  NOT NULL,
          involved_accounts_addresses TEXT[] NOT NULL,
  
          /* Psql partition */
          partition_id                BIGINT NOT NULL,
          height                      BIGINT NOT NULL,
          PRIMARY KEY(transaction_hash, index, partition_id, height)
      )PARTITION BY LIST(partition_id);
      CREATE INDEX message_new_transaction_hash_index ON message_new (transaction_hash);
      CREATE INDEX message_new_type_index ON message_new (type);
      CREATE INDEX message_new_involved_accounts_index ON message_new (involved_accounts_addresses);
      GRANT ALL PRIVILEGES ON message_new TO forbole;`)
  }
  
  module.exports = {
      NewTxTable,
      NewMsgTable,
  }