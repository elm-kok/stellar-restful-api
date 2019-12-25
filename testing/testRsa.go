package main

import (
	"github.com/elm-kok/stellar-restful-api/axlsign"
)

func main() {
	pri := []uint8("SCRQ3ANAG2ODQD6DCUMS2NE537LRBEVWERUZQYP7FF64YC5WNSC5DF4M")
	pub := []uint8("GB5NZNNJVMF66LCJV6CVAFOXLQPAVBEFRABVFEMP7I6LRFBL5TIV5RCQ")
	shareKey := axlsign.SharedKey(pri, pub)
}
