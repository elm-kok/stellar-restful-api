package main

import (
	"bytes"
	"compress/zlib"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"io"
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
func main() {
	key := make([]byte, 32)
	_, err := rand.Read(key)
	if err != nil {
		println("Cannot random secret key with 32 bytes.")
	}
	/*
		s := "Banana...KOKPhakhinDeesee54jmibybjojh9rjt0ohjorjtohjroijtho4jt9ohporkjtohbj4okrt9ohjrjth4jphjdojh;ejrpoithghujiuuhuuuuuuuuuuuuuuuuuuuuuuiuoidfjb09ijr0bje0r98hjb0onmjer098bhj0rehj098bgehr08bg9urewnhjg99cehg098he9gh45w9cnhy9w4hyv9gyjn59cgh085hg9w3087gc438nyxnhy840943h98thji3ht08h5-9hj',konh8ug8ihokojgihjr[tmnhpoirtmhonprwnmt[ohnmjdspoifmhownrpthmpinfbpowmeibnwpornmtb0irntpoihnrpoimhpirmthitrnpimohj9ok50yh9i4k5nh8i5jy0pj4395hj04l5ypjmhtnjol4mj5oiynhrointhg8i45jmpoiyn45hbvoiuyn098hj4n5poynhj084nhj5poi4nhy084hn58iynh4nhj5yv904nhj59iyhj4n5v58418dfgporeiugh8ihj9hjhihjhgrhjg9remidjfohjejrg"
		var b bytes.Buffer
		w := zlib.NewWriter(&b)
		w.Write([]byte(s))
		w.Close()
		ss := string(b.Bytes())
		encryptByte := encrypt(ss, key)
		println("Encrypt:", encryptByte, len(encryptByte))
		decryptString := decrypt(encryptByte, key)
		println("Decrypt:", decryptString)
	*/
	DoctorA := []string{"GB4V7YQHN54MTTRG7BWUBZKTGQQALAIJQBKKSMJ723SY7UZPEAVF6Y4E", "Anna Surassa Fhaumnuaypol"}
	HospitalA := []string{"Bankok Basaka new castle", "chulalongkornhospital.go.th/kcmh2019banana/"}
	DocPub := encrypt(DoctorA[0], key[:])
	DocName := encrypt(DoctorA[1], key[:])
	HosName := encrypt(HospitalA[0], key[:])
	HosUrl := encrypt(HospitalA[1], key[:])

	var b bytes.Buffer
	w := zlib.NewWriter(&b)
	w.Write(DocPub)
	w.Close()
	ss := b.Bytes()
	println(len(ss), len(string(ss)))
	println(len(DocPub), len(DocName), len(HosName), len(HosUrl))
}
