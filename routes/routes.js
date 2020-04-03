const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const dotenv = require("dotenv").config();
const util = require("util");
const {
  getInfoByKey,
  verifySignature,
  verifySignatureWithoutKey
} = require("../stellar");
const {
  PublicKey,
  SecretKey,
  StellarSdk,
  HOSPCODE,
  getInfoByKeyWithoutEncrypt
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
  port: 3306
});
const query = util.promisify(connection.query).bind(connection);
console.log("Connecting...");
connection.connect(function(err) {
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
  connection.query(querycmd, async function(error, results) {
    if (error) {
      return callback(new Error("An error occured during query " + error));
    }
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
        .toString("hex");
      if (
        !verifySignatureWithoutKey(spk, signature, spk + "_" + hopscode) ||
        hospSig !== sigFromHosHash
      ) {
        console.log("Signature fail for Patient SPK: " + spk);
        return callback(false);
      }
      return callback(results[0].PID);
    } catch (e) {
      console.log(e);
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
  connection.query(querycmd, async function(error, results) {
    if (error) {
      return callback(new Error("An error occured during query " + error));
    }
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
        .toString("hex");
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
      console.log(e);
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
        PROV_LNAME: rows[i].PROV_LNAME
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
        ALEVEL: rows[i].ALEVEL
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
        LABRESULT: rows[i].LABRESULT
      });
    }

    return results;
  } catch (e) {
    console.log(e);
    return false;
  }
}
router.post("/fetchByPatient", async function(req, res) {
  const SPK = req.body.SPK;
  const HospCode = req.body.HospCode;
  const Signature = req.body.Signature;
  SPK2PID(SPK, Signature, HospCode, async function(PID) {
    try {
      console.log("Patient -> PID: ", PID);
      const DRUG_OPDs = await DRUG_OPD(PID, HospCode);
      const LABs = await LAB(PID, HospCode);
      const DRUGALLERGYs = await DRUGALLERGY(PID, HospCode);
      result = {
        DRUG_OPD: DRUG_OPDs,
        LAB: LABs,
        DRUGALLERGY: DRUGALLERGYs
      };
      console.log(DRUG_OPDs.length, LABs.length, DRUGALLERGYs.length);
      console.log(
        Math.max.apply(
          Math,
          DRUG_OPDs.map(function(o) {
            return Buffer.from(JSON.stringify(o)).length;
          })
        )
      );
      console.log(
        Math.max.apply(
          Math,
          LABs.map(function(o) {
            return Buffer.from(JSON.stringify(o)).length;
          })
        )
      );
      console.log(
        Math.max.apply(
          Math,
          DRUGALLERGYs.map(function(o) {
            return Buffer.from(JSON.stringify(o)).length;
          })
        )
      );
      console.log("BYTES: ", Buffer.from(JSON.stringify(result)).length);
      res.json(result);
    } catch (e) {
      res.json(e);
    }
  });
});

router.post("/fetchByDoctor", async function(req, res) {
  const PatientSPK = req.body.PatientSPK;
  const DoctorSPK = req.body.DoctorSPK;
  const DoctorSignature = req.body.DoctorSignature;
  const HospCode = req.body.HospCode;
  const SEQ = req.body.SEQ;
  const HospitalSignature = req.body.HospitalSignature;

  SPK2PIDDoctor(
    PatientSPK,
    DoctorSPK,
    SEQ,
    DoctorSignature,
    HospitalSignature,
    HospCode,
    async function(PID) {
      try {
        console.log("Doctor -> PID: ", PID);
        const DRUG_OPDs = await DRUG_OPD(PID, HospCode);
        const LABs = await LAB(PID, HospCode);
        const DRUGALLERGYs = await DRUGALLERGY(PID, HospCode);
        result = {
          DRUG_OPD: DRUG_OPDs,
          LAB: LABs,
          DRUGALLERGY: DRUGALLERGYs
        };
        res.json(result);
      } catch (e) {
        res.json(e);
      }
    }
  );
});

router.post("/findPid/", function(req, res) {
  var HOSPCODE = req.body.HOSPCODE;
  var CID = req.body.CID;
  const querycmd =
    "SELECT PID FROM PERSON WHERE CID=" +
    connection.escape(CID) +
    " AND HOSPCODE=" +
    connection.escape(HOSPCODE);
  connection.query(querycmd, (err, results) => {
    if (err || results.length < 1) {
      res.json("PID not found");
      return;
    }
    console.log("PID: ", results[0].PID);
    const KP = StellarSdk.Keypair.fromSecret(SecretKey);
    const sig = KP.sign(
      Buffer.from(results[0].PID + "_" + req.body.SPK)
    ).toString("base64");
    const key512Bits1000Iterations = crypto
      .pbkdf2Sync(sig, "", 1000, 64, "sha512")
      .toString();
    var values = [
      [req.body.SPK, results[0].PID, req.body.Seq, req.body.HOSPCODE]
    ];
    var sql =
      "INSERT INTO STELLARKEY (SPK, PID, SEQ, HOSPCODE) VALUES ? ON DUPLICATE KEY UPDATE SPK=" +
      connection.escape(req.body.SPK) +
      ",SEQ=" +
      connection.escape(req.body.Seq);
    connection.query(sql, [values], function(err, result) {
      if (err) {
        console.log(err);
        res.json(err);
      }
      res.json({ Secret: key512Bits1000Iterations });
    });
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
      querycmd +
      " WHERE ID=" +
      connection.escape(ID) +
      " && DRUG_OPD.HOSPCODE=" +
      connection.escape(HOSPCODE);
  if (PID)
    querycmd =
      querycmd +
      " WHERE PID=" +
      connection.escape(PID) +
      " && DRUG_OPD.HOSPCODE=" +
      connection.escape(HOSPCODE);
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
      querycmd +
      " WHERE ID=" +
      connection.escape(ID) +
      " && DRUGALLERGY.HOSPCODE=" +
      connection.escape(HOSPCODE);
  if (PID)
    querycmd =
      querycmd +
      " WHERE PID=" +
      connection.escape(PID) +
      " && DRUGALLERGY.HOSPCODE=" +
      connection.escape(HOSPCODE);
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
    querycmd =
      querycmd +
      " WHERE ID=" +
      connection.escape(ID) +
      " && LABFU.HOSPCODE=" +
      connection.escape(HOSPCODE);
  if (PID)
    querycmd =
      querycmd +
      " WHERE PID=" +
      connection.escape(PID) +
      " && LABFU.HOSPCODE=" +
      connection.escape(HOSPCODE);
  console.log(querycmd);
  connection.query(querycmd, (err, results) => {
    if (err) {
      return new Error("An error occured during query " + err);
    }
    console.log(results);
    res.json(results);
  });
});

router.post("/secret/", function(req, res, next) {
  var values = [[req.body.spk, req.body.pid, req.body.seq, req.body.HOSPCODE]];
  var sql =
    "INSERT INTO STELLARKEY (SPK, PID, SEQ, HOSPCODE) VALUES ? ON DUPLICATE KEY UPDATE spk=" +
    connection.escape(req.body.spk) +
    ",SEQ=" +
    connection.escape(req.body.seq);
  connection.query(sql, [values], function(err, result) {
    if (err) {
      console.log(err);
      res.json(err);
    }
    res.json("Added");
  });
});

router.post("/test/", function(req, res, next) {
  const spk = req.body.spk;
  console.log(spk);
  res.json("spk");
});

router.post("/secret_test/", function(req, res, next) {
  var HOSPCODE = req.body.HOSPCODE;
  var ID = req.body.ID;
  const querycmd =
    "SELECT PID FROM PERSON WHERE CID=" +
    connection.escape(ID) +
    " AND HOSPCODE=" +
    connection.escape(HOSPCODE);
  connection.query(querycmd, (err, results) => {
    if (err) {
      return new Error("An error occured during query " + err);
    }
    res.json(results[0].PID);
  });

  var values = [[req.body.spk, req.body.pid, req.body.seq, req.body.HOSPCODE]];
  var sql =
    "INSERT INTO STELLARKEY (SPK, PID, SEQ, HOSPCODE) VALUES ? ON DUPLICATE KEY UPDATE spk=" +
    connection.escape(req.body.spk) +
    ",SEQ=" +
    connection.escape(req.body.seq);
  connection.query(sql, [values], function(err, result) {
    if (err) {
      console.log(err);
      res.json(err);
    }
    res.json("Added");
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
