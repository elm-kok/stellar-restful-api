package handler

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"log"
	"net/http"

	"github.com/elm-kok/stellar-restful-api/app/model"
	"github.com/jinzhu/gorm"
	"github.com/stellar/go/clients/horizonclient"
)

type Patient struct {
	PatientStellarPub string
	PatientServerPub  string
	PatientPayload    string
	PatientSecret     string
}

func Register(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patient := model.Patient{}
	var PSeed PatientSeed
	var PS PatientKP

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&PSeed); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()

	kp, err := seedToKeypair(PSeed.Seed)
	if err != nil {
		log.Panic("Keypair Error from enter seed.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	PS.PatientPri = kp.Seed()
	PS.PatientPub = kp.Address()

	client := horizonclient.DefaultTestNetClient
	_, err = client.Fund(PS.PatientPub)
	if err != nil {
		log.Panic("Account already exists.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	token := make([]byte, 256)
	rand.Read(token)
	jwt := sha256.Sum256(token)
	key := sha256.Sum256([]byte(PS.PatientPri + "0"))

	Patient.PatientID = PS.PatientPub
	Patient.SecretKey = key[:]
	Patient.JWT = jwt[:]

	accountRequest := horizonclient.AccountRequest{AccountID: PS.PatientPub}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account fail: ", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := db.Save(&Patient).Error; err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	hAccount.Data["jwt"] = string(jwt[:])
	respondJSON(w, http.StatusCreated, hAccount.Data)
}
