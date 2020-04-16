const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const dotenv = require("dotenv").config();
const util = require("util");
const { verifySignatureWithoutKey } = require("../stellar");
const {
  SecretKey,
  StellarSdk,
  getInfoByKeyWithoutEncrypt,
} = require("../stellar");
const crypto = require("crypto");
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
  port: 3306,
});
const query = util.promisify(connection.query).bind(connection);
console.log("Connecting...");
connection.connect(function (err) {
  if (err) return new Error("An error occured during SQL connection " + err);
  console.log("Connected!");
});
console.log(connection.config);

async function SPK2PID(spk, signature, hopscode, callback) {
  const querycmd =
    "SELECT * FROM STELLARKEY WHERE STELLARKEY.SPK = " +
    connection.escape(spk) +
    " AND STELLARKEY.HOSPCODE = " +
    connection.escape(hopscode) +
    ";";
  connection.query(querycmd, async function (error, results) {
    if (results.length < 1 || error) return callback(false);
    try {
      const hospSigJson = JSON.parse(
        await getInfoByKeyWithoutEncrypt(spk, results[0].SEQ)
      );
      if (!hospSigJson.Status) return callback(false);

      const hospSig = hospSigJson.Signature;
      const KP = StellarSdk.Keypair.fromSecret(SecretKey);
      const sigFromHos = KP.sign(
        Buffer.from(results[0].PID + "_" + spk)
      ).toString("base64");
      const sigFromHosHash = crypto
        .pbkdf2Sync(sigFromHos, "", 1000, 64, "sha512")
        .toString("base64");
      if (
        !verifySignatureWithoutKey(spk, signature, spk + "_" + hopscode) ||
        hospSig !== sigFromHosHash
      ) {
        return callback(false);
      }
      return callback(results[0].PID);
    } catch (e) {
      return callback(false);
    }
  });
}

async function SPK2PIDDoctor(
  PatientSPK,
  DoctorSPK,
  SEQ,
  DoctorSignature,
  HospitalSignature,
  HospCode,
  callback
) {
  const querycmd =
    "SELECT * FROM STELLARKEY WHERE STELLARKEY.SPK = " +
    connection.escape(PatientSPK) +
    " AND STELLARKEY.HOSPCODE = " +
    connection.escape(HospCode) +
    ";";
  connection.query(querycmd, async function (error, results) {
    if (results.length < 1 || error) return callback(false);
    try {
      const hospSigJson = JSON.parse(
        await getInfoByKeyWithoutEncrypt(PatientSPK, results[0].SEQ)
      );
      if (!hospSigJson.Status) return callback(false);
      const docSigJson = JSON.parse(
        await getInfoByKeyWithoutEncrypt(PatientSPK, SEQ)
      );
      if (!docSigJson.Status) return callback(false);
      const docSig = docSigJson.Signature;

      const sigFromDocHash = crypto
        .pbkdf2Sync(DoctorSignature, "", 1000, 64, "sha512")
        .toString("base64");

      if (
        !verifySignatureWithoutKey(
          DoctorSPK,
          HospitalSignature,
          PatientSPK + "_" + HospCode
        ) ||
        sigFromDocHash !== docSig
      ) {
        return callback(false);
      }
      return callback(results[0].PID);
    } catch (e) {
      return callback(false);
    }
  });
}
async function DRUG_OPD(PID, HospCode) {
  var querycmd =
    "SELECT DRUG_OPD.ID, CODE_HOSPITAL.FULLNAME AS HOSNAME, DRUG_OPD.HOSPCODE, DRUG_OPD.PID, DRUG_OPD.SEQ, DRUG_OPD.DATE_SERV, CODE_CLINIC.DESCRIPTION AS CLINIC, CODE_DIDSTD.DRUGNAME AS DRUGNAME, CODE_DIDSTD.DGDSFNM AS COMSUME, CODE_DIDSTD.COMP AS DCOMP, DRUG_OPD.DNAME, DRUG_OPD.AMOUNT, CODE_DRUGUNIT.DESCRIPTION AS DUNIT, DRUG_OPD.UNIT_PACKING, DRUG_OPD.DRUGPRICE, DRUG_OPD.DRUGCOST, PROVIDER.PRENAME AS PROV_PRENAME, PROVIDER.NAME AS PROV_NAME, PROVIDER.LNAME AS PROV_LNAME, DRUG_OPD.PROVIDER AS PROV_NO FROM DRUG_OPD LEFT JOIN CODE_DIDSTD ON DRUG_OPD.DIDSTD=CODE_DIDSTD.STD_CODE LEFT JOIN CODE_DRUGUNIT ON DRUG_OPD.UNIT=CODE_DRUGUNIT.CODE LEFT JOIN CODE_CLINIC ON DRUG_OPD.CLINIC=CODE_CLINIC.CODE LEFT JOIN PROVIDER ON DRUG_OPD.PROVIDER=PROVIDER.PROVIDER LEFT JOIN CODE_HOSPITAL ON DRUG_OPD.HOSPCODE=CODE_HOSPITAL.HOSPITALCODE ";
  querycmd =
    querycmd +
    " WHERE PID=" +
    connection.escape(PID) +
    " && DRUG_OPD.HOSPCODE=" +
    connection.escape(HospCode);

  try {
    const rows = await query(querycmd);
    var i;
    var results = [];
    for (i = 0; i < rows.length; ++i) {
      results.push({
        DATE_SERV: rows[i].DATE_SERV,
        DRUGNAME: rows[i].DRUGNAME,
        COMSUME: rows[i].COMSUME,
        DCOMP: rows[i].DCOMP,
        DNAME: rows[i].DNAME,
        AMOUNT: rows[i].AMOUNT,
        DUNIT: rows[i].DUNIT,
        UNIT_PACKING: rows[i].UNIT_PACKING,
        PROV_PRENAME: rows[i].PROV_PRENAME,
        PROV_NAME: rows[i].PROV_NAME,
        PROV_LNAME: rows[i].PROV_LNAME,
      });
    }

    return results;
  } catch (e) {
    console.log(e);
    return false;
  }
}
async function DRUGALLERGY(PID, HospCode) {
  var querycmd =
    "SELECT DRUGALLERGY.ID, CODE_HOSPITAL.FULLNAME AS HOSNAME, DRUGALLERGY.HOSPCODE, DRUGALLERGY.PID, DRUGALLERGY.DATERECORD, DRUGALLERGY.DNAME, CODE_DRUGALLERGY_TYPEDX.DESCRIPTION AS TYPEDX, CODE_DRUGALLERGY_INFORMANT.DESCRIPTION AS INFORMANT, CODE_DRUGALLERGY_ALEVEL.DESCRIPTION AS ALEVEL FROM DRUGALLERGY LEFT JOIN CODE_DRUGALLERGY_TYPEDX ON DRUGALLERGY.TYPEDX=CODE_DRUGALLERGY_TYPEDX.CODE LEFT JOIN CODE_DRUGALLERGY_INFORMANT ON DRUGALLERGY.INFORMANT=CODE_DRUGALLERGY_INFORMANT.CODE LEFT JOIN CODE_DRUGALLERGY_ALEVEL ON DRUGALLERGY.ALEVEL=CODE_DRUGALLERGY_ALEVEL.CODE LEFT JOIN CODE_HOSPITAL ON DRUGALLERGY.HOSPCODE=CODE_HOSPITAL.HOSPITALCODE ";
  querycmd =
    querycmd +
    " WHERE PID=" +
    connection.escape(PID) +
    " && DRUGALLERGY.HOSPCODE=" +
    connection.escape(HospCode);

  try {
    const rows = await query(querycmd);
    var i;
    var results = [];
    for (i = 0; i < rows.length; ++i) {
      results.push({
        DATERECORD: rows[i].DATERECORD,
        DNAME: rows[i].DNAME,
        TYPEDX: rows[i].TYPEDX,
        INFORMANT: rows[i].INFORMANT,
        ALEVEL: rows[i].ALEVEL,
      });
    }

    return results;
  } catch (e) {
    console.log(e);
    return false;
  }
}
async function LAB(PID, HospCode) {
  var querycmd =
    "SELECT LABFU.ID, CODE_HOSPITAL.FULLNAME AS HOSNAME, LABFU.HOSPCODE, LABFU.PID, LABFU.SEQ, LABFU.DATE_SERV, LABFU.LABTEST AS LABID, CODE_LABFU_LABTEST.DESCRIPTION AS LABTEST, LABFU.LABRESULT FROM LABFU LEFT JOIN CODE_LABFU_LABTEST ON LABFU.LABTEST=CODE_LABFU_LABTEST.CODE LEFT JOIN CODE_HOSPITAL ON LABFU.HOSPCODE=CODE_HOSPITAL.HOSPITALCODE ";

  querycmd =
    querycmd +
    " WHERE PID=" +
    connection.escape(PID) +
    " && LABFU.HOSPCODE=" +
    connection.escape(HospCode);

  try {
    const rows = await query(querycmd);
    var i;
    var results = [];
    for (i = 0; i < rows.length; ++i) {
      results.push({
        DATE_SERV: rows[i].DATE_SERV,
        LABID: rows[i].LABID,
        LABTEST: rows[i].LABTEST,
        LABRESULT: rows[i].LABRESULT,
      });
    }

    return results;
  } catch (e) {
    console.log(e);
    return false;
  }
}
router.post("/fetchByPatient", async function (req, res) {
  const SPK = req.body.SPK;
  const HospCode = req.body.HospCode;
  const Signature = req.body.Signature;
  if (
    HospCode === undefined ||
    HospCode.length !== 5 ||
    !/^\d+$/.test(HospCode)
  ) {
    res.status(400).send({
      message: "HOSPCODE must be 5 digits",
    });
    return;
  }
  if (SPK === undefined || SPK.length !== 56 || SPK !== SPK.toUpperCase()) {
    res.status(400).send({
      message: "SPK must be 56 uppercase characters",
    });
    return;
  }
  if (Signature === undefined) {
    res.status(400).send({
      message: "Signature must not blank",
    });
    return;
  }
  SPK2PID(SPK, Signature, HospCode, async function (PID) {
    try {
      if (!PID) {
        res.status(401).send({
          message: "Signature verification fail",
        });
        return;
      }
      const DRUG_OPDs = await DRUG_OPD(PID, HospCode);
      const LABs = await LAB(PID, HospCode);
      const DRUGALLERGYs = await DRUGALLERGY(PID, HospCode);
      result = {
        DRUG_OPD: DRUG_OPDs,
        LAB: LABs,
        DRUGALLERGY: DRUGALLERGYs,
      };
      res.json(result);
      return;
    } catch (e) {}
  });
});

router.post("/fetchByDoctor", async function (req, res) {
  const PatientSPK = req.body.PatientSPK;
  const DoctorSPK = req.body.DoctorSPK;
  const DoctorSignature = req.body.DoctorSignature;
  const HospCode = req.body.HospCode;
  const SEQ = req.body.SEQ;
  const HospitalSignature = req.body.HospitalSignature;

  if (DoctorSignature === undefined) {
    res.status(400).send({
      message: "DoctorSignature must not blank",
    });
    return;
  }
  if (HospitalSignature === undefined) {
    res.status(400).send({
      message: "HospitalSignature must not blank",
    });
    return;
  }
  if (
    HospCode === undefined ||
    HospCode.length !== 5 ||
    !/^\d+$/.test(HospCode)
  ) {
    res.status(400).send({
      message: "HOSPCODE must be 5 digits",
    });
    return;
  }
  if (
    PatientSPK === undefined ||
    PatientSPK.length !== 56 ||
    PatientSPK !== PatientSPK.toUpperCase()
  ) {
    res.status(400).send({
      message: "PatientSPK must be 56 uppercase characters",
    });
    return;
  }

  if (
    DoctorSPK === undefined ||
    DoctorSPK.length !== 56 ||
    DoctorSPK !== DoctorSPK.toUpperCase()
  ) {
    res.status(400).send({
      message: "DoctorSPK must be 56 uppercase characters",
    });
    return;
  }
  if (SEQ === undefined || !/^\d+$/.test(SEQ)) {
    res.status(400).send({
      message: "SEQ must be digits",
    });
    return;
  }

  SPK2PIDDoctor(
    PatientSPK,
    DoctorSPK,
    SEQ,
    DoctorSignature,
    HospitalSignature,
    HospCode,
    async function (PID) {
      try {
        if (!PID) {
          res.status(401).send({
            message: "Signature verification fail",
          });
          return;
        }
        const DRUG_OPDs = await DRUG_OPD(PID, HospCode);
        const LABs = await LAB(PID, HospCode);
        const DRUGALLERGYs = await DRUGALLERGY(PID, HospCode);
        result = {
          DRUG_OPD: DRUG_OPDs,
          LAB: LABs,
          DRUGALLERGY: DRUGALLERGYs,
        };
        res.json(result);
        return;
      } catch (e) {
        res.status(503).send({
          message: "Service Unavailable",
        });
      }
    }
  );
});

router.post("/findPid/", function (req, res) {
  const HOSPCODE = req.body.HOSPCODE;
  if (
    HOSPCODE === undefined ||
    HOSPCODE.length !== 5 ||
    !/^\d+$/.test(HOSPCODE)
  ) {
    res.status(400).send({
      message: "HOSPCODE must be 5 digits",
    });
    return;
  }
  const CID = req.body.CID;
  if (CID === undefined || CID.length !== 13 || !/^\d+$/.test(CID)) {
    res.status(400).send({
      message: "CID must be 13 digits",
    });
    return;
  }
  const SPK = req.body.SPK;
  if (SPK === undefined || SPK.length !== 56 || SPK !== SPK.toUpperCase()) {
    res.status(400).send({
      message: "SPK must be 56 uppercase characters",
    });
    return;
  }
  const Seq = req.body.Seq;
  if (Seq === undefined || !/^\d+$/.test(Seq)) {
    res.status(400).send({
      message: "Seq must be digits",
    });
    return;
  }
  const querycmd =
    "SELECT PID FROM PERSON WHERE CID=" +
    connection.escape(CID) +
    " AND HOSPCODE=" +
    connection.escape(HOSPCODE);
  connection.query(querycmd, (err, results) => {
    if (err || results.length < 1) {
      res.status(404).send({
        message: "PID not found",
      });
      return;
    }

    const KP = StellarSdk.Keypair.fromSecret(SecretKey);
    const sig = KP.sign(Buffer.from(results[0].PID + "_" + SPK)).toString(
      "base64"
    );
    const key512Bits1000Iterations = crypto
      .pbkdf2Sync(sig, "", 1000, 64, "sha512")
      .toString("base64");
    const values = [[SPK, results[0].PID, Seq, HOSPCODE]];
    const sql =
      "INSERT INTO STELLARKEY (SPK, PID, SEQ, HOSPCODE) VALUES ? ON DUPLICATE KEY UPDATE SPK=" +
      connection.escape(SPK) +
      ",SEQ=" +
      connection.escape(Seq);
    connection.query(sql, [values], function (err, result) {
      if (err) {
        res.status(503).send({
          message: "Service Unavailable",
        });
      }
      res.json({ Secret: key512Bits1000Iterations });
    });
  });
});

router.post("/findPidPrivate/", function (req, res) {
  const HOSPCODE = req.body.HOSPCODE;
  if (
    HOSPCODE === undefined ||
    HOSPCODE.length !== 5 ||
    !/^\d+$/.test(HOSPCODE)
  ) {
    res.status(400).send({
      message: "HOSPCODE must be 5 digits",
    });
    return;
  }
  const CID = req.body.CID;
  if (CID === undefined || CID.length !== 13 || !/^\d+$/.test(CID)) {
    res.status(400).send({
      message: "CID must be 13 digits",
    });
    return;
  }
  const SPK = req.body.SPK;
  if (SPK === undefined || SPK.length !== 56 || SPK !== SPK.toUpperCase()) {
    res.status(400).send({
      message: "SPK must be 56 uppercase characters",
    });
    return;
  }
  const Seq = req.body.Seq;
  if (Seq === undefined || !/^\d+$/.test(Seq)) {
    res.status(400).send({
      message: "Seq must be digits",
    });
    return;
  }
  const querycmd =
    "SELECT PID FROM PERSON WHERE CID=" +
    connection.escape(CID) +
    " AND HOSPCODE=" +
    connection.escape(HOSPCODE);
  connection.query(querycmd, (err, results) => {
    if (err || results.length < 1) {
      res.status(404).send({
        message: "PID not found",
      });
      return;
    }

    const KP = StellarSdk.Keypair.fromSecret(SecretKey);
    const sig = KP.sign(Buffer.from(results[0].PID + "_" + SPK)).toString(
      "base64"
    );
    const key512Bits1000Iterations = crypto
      .pbkdf2Sync(sig, "", 1000, 64, "sha512")
      .toString("base64");
    const values = [[SPK, results[0].PID, Seq, HOSPCODE]];
    const sql =
      "INSERT INTO STELLARKEY (SPK, PID, SEQ, HOSPCODE) VALUES ? ON DUPLICATE KEY UPDATE SPK=" +
      connection.escape(SPK) +
      ",SEQ=" +
      connection.escape(Seq);
    connection.query(sql, [values], function (err, result) {
      if (err) {
        res.status(503).send({
          message: "Service Unavailable",
        });
      }
      res.json({ Secret: key512Bits1000Iterations });
    });
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
