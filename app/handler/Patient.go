package handler

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/elm-kok/stellar-restful-api/app/model"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	"github.com/stellar/go/clients/horizonclient"
	"github.com/stellar/go/keypair"
	"github.com/stellar/go/network"
	"github.com/stellar/go/txnbuild"
)

type PatientStructure struct {
	PatientPub string
	PatientPri string
}
type PatientReq struct {
	Seed string
}

func seedToKeypair(s string) (*keypair.Full, error) {
	seed := sha256.Sum256([]byte(s))
	kp, err := keypair.FromRawSeed(seed)
	return kp, err
}

func submitTransaction(PatientPri string, PatientPub string, w http.ResponseWriter, DocPub []byte, i int) {
	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: PatientPub}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account fail: ", err)
	}
	op := txnbuild.ManageData{
		Name:  "test" + strconv.Itoa(i),
		Value: DocPub,
	}
	tx := txnbuild.Transaction{
		SourceAccount: &hAccount,
		Operations:    []txnbuild.Operation{&op},
		Timebounds:    txnbuild.NewTimeout(300), // Use a real timeout in production!
		Network:       network.TestNetworkPassphrase,
	}
	kp, _ := keypair.Parse(PatientPri)
	txe, err := tx.BuildSignEncode(kp.(*keypair.Full))
	if err != nil {
		fmt.Println(err)
	}

	_, err = client.SubmitTransactionXDR(txe)
	if err != nil {
		hError := err.(*horizonclient.Error)
		log.Panic("Error submitting transaction:", hError.Problem)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
}
func encrypt(dataString string, passphrase []byte) []byte {
	data := []byte(dataString)
	block, _ := aes.NewCipher(passphrase)
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		panic(err.Error())
	}
	ciphertext := gcm.Seal(nonce, nonce, data, nil)
	return ciphertext
}

func decrypt(data []byte, passphrase []byte) string {
	key := passphrase
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}
	nonceSize := gcm.NonceSize()
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic(err.Error())
	}
	return string(plaintext)
}
func GetAllPatients(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patients := []model.Patient{}
	db.Find(&Patients)
	respondJSON(w, http.StatusOK, Patients)
}

func CreatePatient(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patient := model.Patient{}
	var PReq PatientReq
	var PS PatientStructure

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&PReq); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()

	kp, err := seedToKeypair(PReq.Seed)
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

func PatientLogin(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patient := model.Patient{}
	var PS PatientStructure
	var PReq PatientReq

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&PReq); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	defer r.Body.Close()

	kp, err := seedToKeypair(PReq.Seed)
	if err != nil {
		log.Panic("Keypair Error from enter seed.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	PS.PatientPri = kp.Seed()
	PS.PatientPub = kp.Address()

	client := horizonclient.DefaultTestNetClient
	token := make([]byte, 256)
	rand.Read(token)
	jwt := sha256.Sum256(token)
	Patient.PatientID = PS.PatientPub
	Patient.JWT = jwt[:]

	accountRequest := horizonclient.AccountRequest{AccountID: PS.PatientPub}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account not exists.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := db.Table("patients").Where("patient_id = ?", PS.PatientPub).Update(&Patient).Error; err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	hAccount.Data["jwt"] = string(jwt[:])
	respondJSON(w, http.StatusCreated, hAccount.Data)
}

/*
DoctorA := []string{"GB4V7YQHN54MTTRG7BWUBZKTGQQ", "Anna Surassa Fhaumnuaypol"}

	DocPub := encrypt(DoctorA[0], key[:])
	for i := 0; i < 100; i++ {
		submitTransaction(PS.PatientPri, PS.PatientPub, w, DocPub, i)
	}
*/
func GetPatient(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	PatientID := vars["Patient"]
	Patient := getPatientOr404(db, PatientID, w, r)
	if Patient == nil {
		respondJSON(w, http.StatusNotFound, vars)
		return
	}
	respondJSON(w, http.StatusOK, Patient)
}

func UpdatePatient(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	PatientID := vars["Patient"]
	Patient := getPatientOr404(db, PatientID, w, r)
	if Patient == nil {
		return
	}

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&Patient); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()

	if err := db.Save(&Patient).Error; err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, Patient)
}

func DeletePatient(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	PatientID := vars["Patient"]
	Patient := getPatientOr404(db, PatientID, w, r)
	if Patient == nil {
		return
	}
	if err := db.Delete(&Patient).Error; err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusNoContent, nil)
}

// getPatientOr404 gets a Patient instance if exists, or respond the 404 error otherwise
func getPatientOr404(db *gorm.DB, patientID string, w http.ResponseWriter, r *http.Request) *model.Patient {
	Patient := model.Patient{}
	if err := db.First(&Patient, model.Patient{PatientID: patientID}).Error; err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return nil
	}
	return &Patient
}
