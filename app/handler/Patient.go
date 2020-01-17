package handler

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"io"
	"log"
	"net/http"

	"github.com/elm-kok/stellar-restful-api/app/model"
	"github.com/stellar/go/keypair"

	"github.com/jinzhu/gorm"
	"github.com/stellar/go/clients/horizonclient"
)

type Patient struct {
	StellarPub string
	ServerPub  string
	Secret1    []byte
	Secret2    []byte
	FName      string
	LName      string
	Phone      string
}
type PatientReg struct {
	StellarPub string
	ServerPub  string
	FName      string
	LName      string
	Phone      string
	Signature  string
}
type PatientLogin struct {
	StellarPub string
	ServerPub  string
	Signature  string
}
type PatientReturn struct {
	FName  string
	LName  string
	Phone  string
	Secret string
}

var patient Patient
var patientLogin PatientLogin
var patientReg PatientReg
var patientReturn PatientReturn

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
func EncryptWithPublicKey(msg []byte, pub *rsa.PublicKey) []byte {
	//hash := sha512.New()
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, pub, msg)
	if err != nil {
		log.Fatal(err)
	}
	return ciphertext
}
func BytesToPublicKey(pub []byte) *rsa.PublicKey {
	block, _ := pem.Decode(pub)
	enc := x509.IsEncryptedPEMBlock(block)
	b := block.Bytes
	var err error
	if enc {
		log.Println("is encrypted pem block")
		b, err = x509.DecryptPEMBlock(block, nil)
		if err != nil {
			log.Fatal(err)
		}
	}
	key, err := x509.ParsePKCS1PublicKey(b)
	if err != nil {
		log.Fatal(err)
	}
	return key
}
func Register(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	log.Println("REG.")

	//Patient := model.Patient{}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&patientReg); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()

	kp := keypair.MustParse(patientReg.StellarPub)
	sig, _ := base64.StdEncoding.DecodeString(patientReg.Signature)
	err := kp.Verify([]byte(patientReg.ServerPub), sig)
	if err != nil {
		log.Println(err)
		respondError(w, http.StatusUnauthorized, err.Error())
	}

	if err := db.Table("patients").Where("stellar_pub = ?", patientReg.StellarPub).First(&patient).Error; err == nil {
		respondError(w, http.StatusNotAcceptable, "ID already exists.")
		return
	}

	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: patientReg.StellarPub}
	_, err = client.AccountDetail(accountRequest)
	if err == nil {
		log.Panic("Account exists on Stellar.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, err = client.Fund(patientReg.StellarPub)
	if err != nil {
		log.Panic("Account already has been fund.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	token := make([]byte, 256)
	rand.Read(token)
	secretKey := sha256.Sum256(token)

	Patient := model.Patient{}
	Patient.FName = patientReg.FName
	Patient.LName = patientReg.LName
	Patient.Phone = patientReg.Phone
	Patient.ServerPub = patientReg.ServerPub
	Patient.StellarPub = patientReg.StellarPub
	Patient.Secret1 = secretKey[:32]

	seretEncrypt := EncryptWithPublicKey(Patient.Secret1, BytesToPublicKey([]byte(patientReg.ServerPub)))

	sEnc := base64.StdEncoding.EncodeToString(seretEncrypt)

	if err := db.Save(&Patient).Error; err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, sEnc)
}

func Login(db *gorm.DB, w http.ResponseWriter, r *http.Request) {
	log.Println("Login.")
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&patientLogin); err != nil {
		log.Println("Incorrect format request.")
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()

	kp := keypair.MustParse(patientLogin.StellarPub)
	sig, _ := base64.StdEncoding.DecodeString(patientLogin.Signature)
	err := kp.Verify([]byte(patientLogin.ServerPub), sig)
	if err != nil {
		log.Println(err)
		respondError(w, http.StatusUnauthorized, err.Error())
	}
	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: patientLogin.StellarPub}
	_, err = client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account not exists on Stellar.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := db.Table("patients").Where("stellar_pub = ?", patientLogin.StellarPub).First(&patient).Error; err != nil {
		log.Panic("Account not exists on Server.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	seretEncrypt := EncryptWithPublicKey(patient.Secret1, BytesToPublicKey([]byte(patientLogin.ServerPub)))
	sEnc := base64.StdEncoding.EncodeToString(seretEncrypt)

	patientReturn.FName = patient.FName
	patientReturn.LName = patient.LName
	patientReturn.Phone = patient.Phone
	patientReturn.Secret = sEnc

	respondJSON(w, http.StatusOK, patientReturn)
}
