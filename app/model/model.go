package model

import (
	"github.com/jinzhu/gorm"
)

type Patient struct {
	gorm.Model
	StellarPub string `gorm:"unique;size:56;PRIMARY_KEY"`
	ServerPub  string `gorm:"size:427"`
	Secret1    []byte `gorm:"size:32"`
	Secret2    []byte `gorm:"size:32"`
	FName      string `gorm:"size:20"`
	LName      string `gorm:"size:20"`
	Phone      string `gorm:"size:20"`
}

// DBMigrate will create and migrate the tables, and then make the some relationships if necessary
func DBMigrate(db *gorm.DB) *gorm.DB {
	db.AutoMigrate(&Patient{})
	return db
}
