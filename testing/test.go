package main

import (
	"github.com/stellar/go/keypair"
)

func main() {
	inp := []byte("Banana")
	kp, _ := keypair.Random()
	kp1, _ := keypair.Random()
	sign, _ := kp.Sign(inp)
	err := kp1.Verify(inp, sign)
	if err != nil {
		println(err)
	}
}
