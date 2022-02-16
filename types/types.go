package types

type OldTransactionRow struct {
	Hash        string `db:"hash"`
	Height      int64  `db:"height"`
	Success     bool   `db:"success"`
	Messages    string `db:"messages" json:"-"` //array
	Memo        string `db:"memo"`
	Signatures  string `db:"signatures"`   //array
	SignerInfos string `db:"signer_infos"` //array
	Fee         string `db:"fee"`
	GasWanted   int64  `db:"gas_wanted"`
	GasUsed     int64  `db:"gas_used"`
	RawLog      string `db:"raw_log"`
	Logs        string `db:"logs"`
}
