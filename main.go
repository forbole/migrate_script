package main

import (
	"fmt"
	"os"

	"github.com/forbole/bdjuno/v2/database"
	junodb "github.com/forbole/juno/v2/database"

	"github.com/forbole/juno/v2/types/config"
	"github.com/huichiaotsou/migrate_script/types"
)

func main() {
	// Get config
	file := "/Users/aaron/.bdjuno/config.yaml"
	if _, err := os.Stat(file); os.IsNotExist(err) {
		fmt.Println("file inexistent: ", err.Error())
	}
	cfg, err := config.Read(file, config.DefaultConfigParser)
	if err != nil {
		fmt.Println("error while reading config: ", err.Error())
	}

	// Get database
	builder, err := database.Builder(junodb.NewContext(cfg.Database, nil, nil))
	if err != nil {
		fmt.Println("error while getting DB: ", err.Error())
	}

	db := database.Cast(builder)

	var rows []types.OldTransactionRow
	err := db.Sqlx.Select(&rows, `SELECT address FROM account`)

}
