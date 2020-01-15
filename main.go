package main

import (
	"github.com/elm-kok/stellar-restful-api/app"
	"github.com/elm-kok/stellar-restful-api/config"
)

func main() {
	config := config.GetConfig()

	app := &app.App{}
	app.Initialize(config)
	println("Running at port: 3000")
	app.Run(":3000")
}
