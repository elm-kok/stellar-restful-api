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

	"github.com/stellar/go/keypair"

	"github.com/elm-kok/stellar-restful-api/app/model"
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
type PatientPayload struct {
	StellarPub string
	ServerPub  string
	Signature  string
}

var patient Patient
var patientPayload PatientPayload

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
	Patient := model.Patient{}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&Patient); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()

	if err := db.Table("patients").Where("stellar_pub = ?", Patient.StellarPub).First(&patient).Error; err == nil {
		respondError(w, http.StatusNotAcceptable, "ID already exists.")
		return
	}
	client := horizonclient.DefaultTestNetClient
	_, err := client.Fund(Patient.StellarPub)
	if err != nil {
		log.Panic("Account already exists or has been fund.")
		respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	token := make([]byte, 256)
	rand.Read(token)
	secretKey := sha256.Sum256(token)

	Patient.Secret1 = secretKey[:32]

	seretEncrypt := EncryptWithPublicKey(Patient.Secret1, BytesToPublicKey([]byte(Patient.ServerPub)))

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
	if err := decoder.Decode(&patientPayload); err != nil {
		log.Println("Incorrect format request.")
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer r.Body.Close()
	kp := keypair.MustParse(patientPayload.StellarPub)
	sig, _ := base64.StdEncoding.DecodeString(patientPayload.Signature)
	err := kp.Verify([]byte(patientPayload.ServerPub), sig)
	if err != nil {
		log.Println(err)
	}
	client := horizonclient.DefaultTestNetClient
	accountRequest := horizonclient.AccountRequest{AccountID: patientPayload.StellarPub}
	_, err = client.AccountDetail(accountRequest)
	if err != nil {
		log.Panic("Account not exists on Stellar.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := db.Table("patients").Where("stellar_pub = ?", patientPayload.StellarPub).First(&patient).Error; err != nil {
		log.Panic("Account not exists on Server.", err)
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	seretEncrypt := EncryptWithPublicKey(patient.Secret1, BytesToPublicKey([]byte(patientPayload.ServerPub)))
	sEnc := base64.StdEncoding.EncodeToString(seretEncrypt)
	respondJSON(w, http.StatusOK, sEnc)
}
