### Migration script from regular table to partition table
This script will do the following steps:
- Rename the transaction table to transaction_old; message table to message_old
- Rename all the related indexes of transaction_old and message_old tables with adding _old tag
- Create new tables with indexes: transaction & message
- Read from transaction_old and insert into transaction and message tables by batch
- Drop old function messages_by_address and create a new one
- For safety reason it does not drop the old tables

### How to execute the script
#### 1. Add .env file with DB settings and migration settings: 
```shell
// example:
PGUSER=UserName
PGHOST=HOST
PGPASSWORD=PASSWORD
PGDATABASE=DB_NAME
PGPORT=DB_PORT

BATCH=5000  // How many rows to be migrated per batch
PARTITION_SIZE=100000 // The number of block heights per partition 
```

#### 2. Verify if the transaction and message schema in utils/create.js are correct
#### 3. Run "npm run prepare-tables", which will
- Alter the original transaction and message tables to transaction_old & message_old
- Alter the original indexes with adding _old tag
- Create new tables transaction and message with new indexes

#### 4. Run "npm run migrate"

