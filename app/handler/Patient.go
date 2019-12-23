package handler

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/json"
	"io"
	"net/http"

	"github.com/elm-kok/stellar-restful-api/app/model"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
)

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

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&Patient); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()

	key := make([]byte, 32)
	_, err := rand.Read(key)
	if err != nil {
		println("Cannot random secret key with 64 bytes.")
	}

	//Patient.SecretKey = hex.EncodeToString(key)
	Patient.SecretKey = key

	encryptByte := encrypt("Banana...", key)
	println("Encrypt:", encryptByte)
	decryptString := decrypt(encryptByte, key)
	println("Decrypt:", decryptString)

	if err := db.Save(&Patient).Error; err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, Patient)
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
