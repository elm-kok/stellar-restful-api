package main

//package main

import (
	"fmt"

	"github.com/stellar/go/keypair"
	"github.com/stellar/go/network"
	"github.com/stellar/go/xdr"
)

func main() {
	var env xdr.TransactionEnvelope
	err := xdr.SafeUnmarshalBase64("AAAAAE//tVvL/xn3WM2MincerNCe6rekrjZD+f1ACDuU5AxkAAAAZAAAJAEAAuElAAAAAAAAAAAAAAABAAAAAAAAAAMAAAABSFQAAAAAAACbIx6CN2rDLn2KMYzJ36wouCgJ9qAN7GEXXvDJ3frLagAAAAFCVEMAAAAAAJsjHoI3asMufYoxjMnfrCi4KAn2oA3sYRde8Mnd+stqAAAAAAAAAAAAAACpAAWPcAAAAAABmk29AAAAAAAAAAGU5AxkAAAAQFmbZIHErm5yTe9UnrVoRoTtH5aA98Uw1m+H4ZXJs/Y6EIhCGb4e32wijsxMF12HQ73NxkJXE8+fgTSx2x0VIgA=", &env)
	if err != nil {
		panic(err)
	}
	txHash, err := network.HashTransaction(&env.Tx, network.TestNetworkPassphrase)
	if err != nil {
		panic(err)
	}
	kp := keypair.MustParse("GBH77NK3ZP7RT52YZWGIU5Y6VTIJ52VXUSXDMQ7Z7VAAQO4U4QGGIROV")

	err = kp.Verify(txHash[:], env.Signatures[0].Signature)
	fmt.Println("Will be non-nil when sig is invalid:", err)
}
