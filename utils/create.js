const {query} = require("./psql")

async function NewTxTable() {
  console.log("Create new transaction table");
  await query(`CREATE TABLE transaction
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
          partition_id BIGINT NOT NULL
      )PARTITION BY LIST(partition_id);
      ALTER TABLE transaction ADD UNIQUE (hash, partition_id);
      CREATE INDEX transaction_hash_index ON transaction (hash);
      CREATE INDEX transaction_height_index ON transaction (height);
      CREATE INDEX transaction_partition_id_index ON transaction (partition_id);
      GRANT ALL PRIVILEGES ON transaction TO forbole;`)
}
  
async function NewMsgTable() {
  console.log("Create new message table");

  await query(`CREATE TABLE message
    (
          transaction_hash            TEXT   NOT NULL,
          index                       BIGINT NOT NULL,
          type                        TEXT   NOT NULL,
          value                       JSONB  NOT NULL,
          involved_accounts_addresses TEXT[] NOT NULL,
  
          /* Psql partition */
          partition_id                BIGINT NOT NULL,
          height                      BIGINT NOT NULL
      )PARTITION BY LIST(partition_id);
      ALTER TABLE message ADD UNIQUE (transaction_hash, index, partition_id);
      CREATE INDEX message_transaction_hash_index ON message (transaction_hash);
      CREATE INDEX message_type_index ON message (type);
      CREATE INDEX message_involved_accounts_index ON message (involved_accounts_addresses);
      GRANT ALL PRIVILEGES ON message TO forbole;`)
}
  
module.exports = {
  NewTxTable,
  NewMsgTable,
}