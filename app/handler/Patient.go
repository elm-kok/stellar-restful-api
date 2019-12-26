package handler

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"hash/fnv"
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

type PatientKP struct {
	PatientPub string
	PatientPri string
}
type PatientSeed struct {
	Seed string
}

type PatientDoc struct {
	DocPub  string
	DocName string
	Seed    string
}
type PatientHos struct {
	HospitalName string
	HospitalUrl  string
	Seed         string
}

func seedToKeypair(s string) (*keypair.Full, error) {
	seed := sha256.Sum256([]byte(s))
	kp, err := keypair.FromRawSeed(seed)
	return kp, err
}

func partitionPackage(data []byte) [][]byte {
	var i int
	length := 64
	slice := make([][]byte, 1, len(data)/length+2)
	for i = 0; i < len(data)/length+1; i++ {
		if (i+1)*length > len(data) {
			slice = append(slice, data[i*length:len(data)])
		} else {
			slice = append(slice, data[i*length:(i+1)*length])
		}
	}
	return slice
}
func submitStatus(PatientPri string, PatientPub string, w http.ResponseWriter, key string, status string) {

	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: PatientPub}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account fail: ", err)
	}

	op := txnbuild.ManageData{
		Name:  key,
		Value: []byte(status),
	}
	tx := txnbuild.Transaction{
		SourceAccount: &hAccount,
		Operations:    []txnbuild.Operation{&op},
		Timebounds:    txnbuild.NewTimeout(1000), // Use a real timeout in production!
		Network:       network.TestNetworkPassphrase,
	}
	kp, _ := keypair.Parse(PatientPri)
	txe, err := tx.BuildSignEncode(kp.(*keypair.Full))
	if err != nil {
		log.Panic("Sign fails", err)
	}

	_, err = client.SubmitTransactionXDR(txe)
	if err != nil {
		hError := err.(*horizonclient.Error)
		log.Panic("Error submitting transaction:", hError.Problem)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

}
func submitTransaction(PatientPri string, PatientPub string, w http.ResponseWriter, packs [][]byte, key string) {
	var i int
	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: PatientPub}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account fail: ", err)
	}
	for i = 1; i < len(packs); i++ {
		j := i
		op := txnbuild.ManageData{
			Name:  key + strconv.Itoa(j),
			Value: []byte(string(packs[j][:])),
		}
		tx := txnbuild.Transaction{
			SourceAccount: &hAccount,
			Operations:    []txnbuild.Operation{&op},
			Timebounds:    txnbuild.NewTimeout(1000), // Use a real timeout in production!
			Network:       network.TestNetworkPassphrase,
		}
		kp, _ := keypair.Parse(PatientPri)
		txe, err := tx.BuildSignEncode(kp.(*keypair.Full))
		if err != nil {
			log.Panic("Sign fails", err)
		}

		_, err = client.SubmitTransactionXDR(txe)
		if err != nil {
			hError := err.(*horizonclient.Error)
			log.Panic("Error submitting transaction:", hError.Problem)
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}
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

func Login(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patient := model.Patient{}
	var PS PatientKP
	var PSeed PatientSeed

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

func AddDoc(db *gorm.DB, w http.ResponseWriter, r *http.Request) {

	Patient := model.Patient{}
	var PD PatientDoc

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&PD); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	defer r.Body.Close()

	kp, err := seedToKeypair(PD.Seed)
	if err != nil {
		log.Panic("Keypair Error from enter seed.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	Patient.PatientID = kp.Address()

	if err := db.Where("patient_id = ?", kp.Address()).First(&Patient).Error; err != nil {
		log.Panic(err)
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	DocNameEn := encrypt(PD.DocName, Patient.SecretKey)
	DocPubEn := encrypt(PD.DocPub, Patient.SecretKey)
	DocPubEnPacks := partitionPackage(DocPubEn)
	DocNameEnPacks := partitionPackage(DocNameEn)

	DocID := fnv.New32a()
	DocID.Write(append([]byte(PD.DocPub), Patient.SecretKey...))
	submitTransaction(kp.Seed(), kp.Address(), w, DocPubEnPacks, "DK"+strconv.Itoa(int(DocID.Sum32()))+"_")
	submitTransaction(kp.Seed(), kp.Address(), w, DocNameEnPacks, "DN"+strconv.Itoa(int(DocID.Sum32()))+"_")
	submitStatus(kp.Seed(), kp.Address(), w, "D"+strconv.Itoa(int(DocID.Sum32())), "T")
	/*
		s1 := "YURY+Iv8AgXzo2XP8PuaDLGluyYjNGBCAiQ8oSArJKItBQLvl7Czvxzy3Hq1LNHQfHn4Gv4u9S5s+zgdW8Aqmg=="
		s2 := "np/kOglGWgfNCyscd6GLafK9zm4="
		result1, _ := base64.StdEncoding.DecodeString(s1)
		result2, _ := base64.StdEncoding.DecodeString(s2)
		res := append(result1[:], result2[:]...)
		println(string(res))
		println()
		println(decrypt(DocPubEn, Patient.SecretKey))
		println(decrypt(res, Patient.SecretKey))
	*/
	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: kp.Address()}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account not exists.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, hAccount.Data)
}
func AddHospital(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patient := model.Patient{}
	var PH PatientHos

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&PH); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	defer r.Body.Close()

	kp, err := seedToKeypair(PH.Seed)
	if err != nil {
		log.Panic("Keypair Error from enter seed.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	Patient.PatientID = kp.Address()

	if err := db.Where("patient_id = ?", kp.Address()).First(&Patient).Error; err != nil {
		log.Panic(err)
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	HosNameEn := encrypt(PH.HospitalName, Patient.SecretKey)
	HosUrlEn := encrypt(PH.HospitalUrl, Patient.SecretKey)
	HosUrlEnPacks := partitionPackage(HosUrlEn)
	HosNameEnPacks := partitionPackage(HosNameEn)

	HosID := fnv.New32a()
	HosID.Write(append([]byte(PH.HospitalName), Patient.SecretKey...))
	submitTransaction(kp.Seed(), kp.Address(), w, HosUrlEnPacks, "HU"+strconv.Itoa(int(HosID.Sum32()))+"_")
	submitTransaction(kp.Seed(), kp.Address(), w, HosNameEnPacks, "HN"+strconv.Itoa(int(HosID.Sum32()))+"_")
	submitStatus(kp.Seed(), kp.Address(), w, "H"+strconv.Itoa(int(HosID.Sum32())), "T")

	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: kp.Address()}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account not exists.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, hAccount.Data)
}
func RemoveDoc(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patient := model.Patient{}
	var PD PatientDoc

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&PD); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	defer r.Body.Close()

	kp, err := seedToKeypair(PD.Seed)
	if err != nil {
		log.Panic("Keypair Error from enter seed.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	Patient.PatientID = kp.Address()

	if err := db.Where("patient_id = ?", kp.Address()).First(&Patient).Error; err != nil {
		log.Panic(err)
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	DocID := fnv.New32a()
	DocID.Write(append([]byte(PD.DocPub), Patient.SecretKey...))
	submitStatus(kp.Seed(), kp.Address(), w, "D"+strconv.Itoa(int(DocID.Sum32())), "F")

	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: kp.Address()}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account not exists.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, hAccount.Data)
}
func RemoveHospital(db *gorm.DB, w http.ResponseWriter, r *http.Request) {

	Patient := model.Patient{}
	var PH PatientHos

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&PH); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	defer r.Body.Close()

	kp, err := seedToKeypair(PH.Seed)
	if err != nil {
		log.Panic("Keypair Error from enter seed.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	Patient.PatientID = kp.Address()

	if err := db.Where("patient_id = ?", kp.Address()).First(&Patient).Error; err != nil {
		log.Panic(err)
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	HosID := fnv.New32a()
	HosID.Write(append([]byte(PH.HospitalName), Patient.SecretKey...))
	submitStatus(kp.Seed(), kp.Address(), w, "H"+strconv.Itoa(int(HosID.Sum32())), "F")

	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: kp.Address()}
	hAccount, err := client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account not exists.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, hAccount.Data)
}

func GetAllPatients(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	Patients := []model.Patient{}
	db.Find(&Patients)
	respondJSON(w, http.StatusOK, Patients)
}

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
