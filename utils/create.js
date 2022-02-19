require('dotenv').config();
const {query} = require("./psql")
let { PGUSER } = process.env

async function NewTxTable() {
  console.log("CREATE TABLE transaction");
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
          partition_id BIGINT NOT NULL,
          UNIQUE (hash, partition_id)
      )PARTITION BY LIST(partition_id);
      CREATE INDEX transaction_hash_index ON transaction (hash);
      CREATE INDEX transaction_height_index ON transaction (height);
      CREATE INDEX transaction_partition_id_index ON transaction (partition_id);
      GRANT ALL PRIVILEGES ON transaction TO ${PGUSER};`)
}
  
async function NewMsgTable() {
  console.log("CREATE TABLE message");

  await query(`CREATE TABLE message
    (
          transaction_hash            TEXT   NOT NULL,
          index                       BIGINT NOT NULL,
          type                        TEXT   NOT NULL,
          value                       JSONB  NOT NULL,
          involved_accounts_addresses TEXT[] NOT NULL,
  
          /* Psql partition */
          partition_id                BIGINT NOT NULL,
          height                      BIGINT NOT NULL,
          FOREIGN KEY (transaction_hash, partition_id) REFERENCES transaction (hash, partition_id)
      )PARTITION BY LIST(partition_id);
      CREATE INDEX message_transaction_hash_index ON message (transaction_hash);
      CREATE INDEX message_type_index ON message (type);
      CREATE INDEX message_involved_accounts_index ON message (involved_accounts_addresses);
      GRANT ALL PRIVILEGES ON message TO  ${PGUSER};`)
}

async function NewMessageByAddressFunc() {
  console.log("CREATE FUNCTION messages_by_address()");

  await query(`CREATE FUNCTION messages_by_address(
    addresses TEXT [],
    types TEXT [],
    "limit" BIGINT = 100,
    "offset" BIGINT = 0
  ) RETURNS SETOF message AS $$
  SELECT
      message.transaction_hash,
      message.index,
      message.type,
      message.value,
      message.involved_accounts_addresses,
      message.partition_id,
      message.height
  FROM
      message
  WHERE
      ( cardinality(types) = 0  OR type = ANY (types))
      AND involved_accounts_addresses && addresses
  ORDER BY
      height DESC,
      involved_accounts_addresses
  LIMIT
      "limit" OFFSET "offset" $$ LANGUAGE sql STABLE;
`)
  
}
  
module.exports = {
  NewTxTable,
  NewMsgTable,
  NewMessageByAddressFunc,
}