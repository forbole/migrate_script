
### Add .env file: 
```
PGUSER=UserName
PGHOST=HOST
PGPASSWORD=PASSWORD
PGDATABASE=DB_NAME
PGPORT=DB_PORT
```

### Modify settings.js
```javascript
// How many rows are processed per batch
const BATCH = 500
// Partition Size based on heights (for example, per 100,000 blocks)
const PARTITION_SIZE = 100000
```