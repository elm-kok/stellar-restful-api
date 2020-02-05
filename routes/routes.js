const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const dotenv = require("dotenv").config();
const cors = require("cors");
const { getInfo, verifySignature } = require("../stellar");
const StellarSdk = require("stellar-sdk");
const { SecretKey } = require("../stellar");
/*
DRUG_OPD
DRUGALLERGY
LAB
*/
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: 3306
});

var corsOptions = {
  origin: "http://localhost:3001",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

console.log("Connecting...");
connection.connect(function(err) {
  if (err) return new Error("An error occured during SQL connection " + err);
  console.log("Connected!");
});
console.log(connection.config);

async function verify(doc_spk, signature, _id, callback) {
  const querycmd =
    "SELECT * FROM STELLARKEY WHERE STELLARKEY.CID = " + _id + ";";
  connection.query(querycmd, async function(error, results) {
    if (error) {
      return callback(new Error("An error occured during query " + error));
    }
    if (!verifySignature(doc_spk, signature, _id)) {
      console.log("Signature fail for DOCTOR SPK: " + doc_spk);
      return callback(false);
    }
    const Info = await getInfo(results[0].SPK, results[0].SecretKey);
    var hasDoc = false;
    var hasSig = false;
    const KP = StellarSdk.Keypair.fromSecret(SecretKey);
    console.log(Info);
    for (var it = Info.values(), val = null; (val = it.next().value); ) {
      const valJson = JSON.parse(val);
      if (valJson.Type == "Doctor" && valJson.SPK == doc_spk) {
        hasDoc = true;
      }
      if (valJson.Type == "Signature") {
        hasSig =
          KP.sign(Buffer.from(_id + results[0].SPK)).toString("base64") ==
          valJson.Value;
      }
      if (hasSig && hasDoc) {
        return callback(true);
      }
    }
    return callback(false);
  });
}
router.post("/test", async function(req, res) {
  verify(req.body.SPK, req.body.signature, req.body._id, function(result) {
    console.log(result);
    if (result) res.json("OK");
    else res.json("Fail");
  });
});

router.post("/DRUG_OPD/", function(req, res, next) {
  var HOSPCODE = req.body.HOSPCODE;
  var ID = req.body.ID;
  var PID = req.body.PID;
  if (!HOSPCODE) {
    res.send("HOSPCODE IS REQUIRED");
    return;
  }
  var querycmd =
    "SELECT DRUG_OPD.ID, CODE_HOSPITAL.FULLNAME AS HOSNAME, DRUG_OPD.HOSPCODE, DRUG_OPD.PID, DRUG_OPD.SEQ, DRUG_OPD.DATE_SERV, CODE_CLINIC.DESCRIPTION AS CLINIC, CODE_DIDSTD.DRUGNAME AS DRUGNAME, CODE_DIDSTD.DGDSFNM AS COMSUME, CODE_DIDSTD.COMP AS DCOMP, DRUG_OPD.DNAME, DRUG_OPD.AMOUNT, CODE_DRUGUNIT.DESCRIPTION AS DUNIT, DRUG_OPD.UNIT_PACKING, DRUG_OPD.DRUGPRICE, DRUG_OPD.DRUGCOST, PROVIDER.PRENAME AS PROV_PRENAME, PROVIDER.NAME AS PROV_NAME, PROVIDER.LNAME AS PROV_LNAME, DRUG_OPD.PROVIDER AS PROV_NO FROM DRUG_OPD LEFT JOIN CODE_DIDSTD ON DRUG_OPD.DIDSTD=CODE_DIDSTD.STD_CODE LEFT JOIN CODE_DRUGUNIT ON DRUG_OPD.UNIT=CODE_DRUGUNIT.CODE LEFT JOIN CODE_CLINIC ON DRUG_OPD.CLINIC=CODE_CLINIC.CODE LEFT JOIN PROVIDER ON DRUG_OPD.PROVIDER=PROVIDER.PROVIDER LEFT JOIN CODE_HOSPITAL ON DRUG_OPD.HOSPCODE=CODE_HOSPITAL.HOSPITALCODE ";
  if (ID)
    querycmd =
      querycmd + " WHERE ID=" + ID + " && DRUG_OPD.HOSPCODE=" + HOSPCODE;
  if (PID)
    querycmd =
      querycmd + " WHERE PID=" + PID + " && DRUG_OPD.HOSPCODE=" + HOSPCODE;
  console.log(querycmd);
  connection.query(querycmd, (err, results) => {
    if (err) {
      return new Error("An error occured during query " + err);
    }
    console.log(results);
    res.json(results);
  });
});

router.post("/DRUGALLERGY/", function(req, res, next) {
  var HOSPCODE = req.body.HOSPCODE;
  var ID = req.body.ID;
  var PID = req.body.PID;
  if (!HOSPCODE) {
    res.send("HOSPCODE IS REQUIRED");
    return;
  }
  var querycmd =
    "SELECT DRUGALLERGY.ID, CODE_HOSPITAL.FULLNAME AS HOSNAME, DRUGALLERGY.HOSPCODE, DRUGALLERGY.PID, DRUGALLERGY.DATERECORD, DRUGALLERGY.DNAME, CODE_DRUGALLERGY_TYPEDX.DESCRIPTION AS TYPEDX, CODE_DRUGALLERGY_INFORMANT.DESCRIPTION AS INFORMANT, CODE_DRUGALLERGY_ALEVEL.DESCRIPTION AS ALEVEL FROM DRUGALLERGY LEFT JOIN CODE_DRUGALLERGY_TYPEDX ON DRUGALLERGY.TYPEDX=CODE_DRUGALLERGY_TYPEDX.CODE LEFT JOIN CODE_DRUGALLERGY_INFORMANT ON DRUGALLERGY.INFORMANT=CODE_DRUGALLERGY_INFORMANT.CODE LEFT JOIN CODE_DRUGALLERGY_ALEVEL ON DRUGALLERGY.ALEVEL=CODE_DRUGALLERGY_ALEVEL.CODE LEFT JOIN CODE_HOSPITAL ON DRUGALLERGY.HOSPCODE=CODE_HOSPITAL.HOSPITALCODE ";
  if (ID)
    querycmd =
      querycmd + " WHERE ID=" + ID + " && DRUGALLERGY.HOSPCODE=" + HOSPCODE;
  if (PID)
    querycmd =
      querycmd + " WHERE PID=" + PID + " && DRUGALLERGY.HOSPCODE=" + HOSPCODE;
  console.log(querycmd);
  connection.query(querycmd, (err, results) => {
    if (err) {
      return new Error("An error occured during query " + err);
    }
    console.log(results);
    res.json(results);
  });
});

router.post("/LAB/", function(req, res, next) {
  var HOSPCODE = req.body.HOSPCODE;
  var ID = req.body.ID;
  var PID = req.body.PID;
  if (!HOSPCODE) {
    res.send("HOSPCODE IS REQUIRED");
    return;
  }
  var querycmd =
    "SELECT LABFU.ID, CODE_HOSPITAL.FULLNAME AS HOSNAME, LABFU.HOSPCODE, LABFU.PID, LABFU.SEQ, LABFU.DATE_SERV, LABFU.LABTEST AS LABID, CODE_LABFU_LABTEST.DESCRIPTION AS LABTEST, LABFU.LABRESULT FROM LABFU LEFT JOIN CODE_LABFU_LABTEST ON LABFU.LABTEST=CODE_LABFU_LABTEST.CODE LEFT JOIN CODE_HOSPITAL ON LABFU.HOSPCODE=CODE_HOSPITAL.HOSPITALCODE ";
  if (ID)
    querycmd = querycmd + " WHERE ID=" + ID + " && LABFU.HOSPCODE=" + HOSPCODE;
  if (PID)
    querycmd =
      querycmd + " WHERE PID=" + PID + " && LABFU.HOSPCODE=" + HOSPCODE;
  console.log(querycmd);
  connection.query(querycmd, (err, results) => {
    if (err) {
      return new Error("An error occured during query " + err);
    }
    console.log(results);
    res.json(results);
  });
});

router.post("/secret/", cors(corsOptions), function(req, res, next) {
  var sql = "INSERT INTO STELLARKEY (CID, HOSPCODE, SPK, SecretKey) VALUES ?";
  var values = [
    [req.body.cid, req.body.HOSPCODE, req.body.spk, req.body.secretkey]
  ];
  connection.query(sql, [values], function(err, result) {
    if (err) console.log(err);
  });
});
module.exports = router;

// ACCIDENT D

// ADMISSION D

// APPOINTMENT D

// CHRONIC D

// DRUG_OPD D

// PERSONAL D
// 	DISABILITY D
// 	DRUGALLERGY D

// LAB D

// SERVICE D
