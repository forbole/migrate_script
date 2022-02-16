package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/forbole/bdjuno/v2/database"
	junodb "github.com/forbole/juno/v2/database"
	"github.com/forbole/juno/v2/types/config"
	"github.com/huichiaotsou/migrate_script/types"
)

func main() {
	db := GetDatabase()
	txRows, err := SelectFromTransaction(2, 1, db)
	if err != nil {
		fmt.Println("error while selecting transaction rows from DB: ", err)
	}

	err = ConvertAndStore(txRows)
	if err != nil {
		fmt.Println("error while converting and storing transaction rows to DB: ", err)

	}

}

func GetDatabase() *database.Db {
	// Get config
	file := "/Users/aaron/.bdjuno/config.yaml"
	if _, err := os.Stat(file); os.IsNotExist(err) {
		fmt.Println("file inexistent: ", err)
	}
	cfg, err := config.Read(file, config.DefaultConfigParser)
	if err != nil {
		fmt.Println("error while reading config: ", err)
	}

	// Get database
	builder, err := database.Builder(junodb.NewContext(cfg.Database, nil, nil))
	if err != nil {
		fmt.Println("error while getting DB: ", err)
	}

	return database.Cast(builder)
}

func SelectFromTransaction(limit int, offset int, db *database.Db) ([]types.OldTransactionRow, error) {
	stmt := fmt.Sprintf("SELECT * FROM transaction LIMIT %v OFFSET %v", limit, offset)

	var txRows []types.OldTransactionRow
	err := db.Sqlx.Select(&txRows, stmt)
	if err != nil {
		return nil, err
	}

	return txRows, nil
}

func ConvertAndStore(t []types.OldTransactionRow) error {
	for _, row := range t {
		var messages []interface{}
		err := json.Unmarshal([]byte(row.Messages), &messages)
		if err != nil {
			return err
		}

		for _, msg := range messages {

		}
	}
	return nil
}
