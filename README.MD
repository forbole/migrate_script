### Migration script from regular table to partition table
This script will do the following steps:
- Rename the transaction table to transaction_old; message table to message_old
- Rename all the related indexes of transaction_old and message_old tables with adding _old tag
- Create new tables with indexes: transaction & message
- Drop old function messages_by_address and create a new one
- Read from transaction_old and insert into transaction and message tables by batch
- For safety reason it does not drop the old tables

### How to execute the script
#### Add .env file: 
```
PGUSER=UserName
PGHOST=HOST
PGPASSWORD=PASSWORD
PGDATABASE=DB_NAME
PGPORT=DB_PORT
```

#### Modify settings.js
```javascript
// How many transaction rows are processed per batch
const BATCH = 5000
// How many block heights for 1 partition
const PARTITION_SIZE = 100000
```

#### Verify the schema
- Verify if the schema in utils/create.js is correct. 
