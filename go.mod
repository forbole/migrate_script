module github.com/huichiaotsou/migrate_script

go 1.16

require (
	github.com/forbole/bdjuno/v2 v2.0.0-20220215062547-37bbc9142aeb
	github.com/forbole/juno/v2 v2.0.0-20220125161451-4f6319e432a5
)

replace github.com/gogo/protobuf => github.com/regen-network/protobuf v1.3.3-alpha.regen.1

replace google.golang.org/grpc => google.golang.org/grpc v1.33.2

replace github.com/tendermint/tendermint => github.com/forbole/tendermint v0.34.13-0.20210820072129-a2a4af55563d
