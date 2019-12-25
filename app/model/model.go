package model

import (
	"github.com/jinzhu/gorm"
)

type Patient struct {
	gorm.Model
	PatientID string `gorm:"unique;size:56;PRIMARY_KEY"`
	SecretKey []byte `gorm:"size:32"`
	JWT       []byte `gorm:"size:32"`
}

// DBMigrate will create and migrate the tables, and then make the some relationships if necessary
func DBMigrate(db *gorm.DB) *gorm.DB {
	db.AutoMigrate(&Patient{})
	return db
}
