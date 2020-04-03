/*
Testing demo but not use in the project
Use Postman APIs and Jest to test the system
*/
const mysql = require("mysql");
const dotenv = require("dotenv").config();
const util = require("util");
const crypto = require("crypto");
const StellarSdk = require("stellar-sdk");

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  port: 3306,
});
const query = util.promisify(connection.query).bind(connection);
connection.connect(function (err) {
  if (err) return new Error("An error occured during SQL connection " + err);
  console.log("Connected!");
});
//console.log(connection.config);

function CraftSignature(HOSPCODE, CID, SPK, Seq) {
  const querycmd =
    "SELECT PID FROM PERSON WHERE CID=" +
    connection.escape(CID) +
    " AND HOSPCODE=" +
    connection.escape(HOSPCODE);

  return connection.query(querycmd, (err, results) => {
    if (err || results.length < 1) {
      return "PID not found";
    }
    const KP = StellarSdk.Keypair.fromSecret(SecretKey);
    const sig = KP.sign(Buffer.from(results[0].PID + "_" + SPK)).toString(
      "base64"
    );
    const key512Bits1000Iterations = crypto
      .pbkdf2Sync(sig, "", 1000, 64, "sha512")
      .toString("base64");
    var values = [[SPK, results[0].PID, Seq, HOSPCODE]];
    var sql =
      "INSERT INTO STELLARKEY (SPK, PID, SEQ, HOSPCODE) VALUES ? ON DUPLICATE KEY UPDATE SPK=" +
      connection.escape(SPK) +
      ",SEQ=" +
      connection.escape(Seq);
    connection.query(sql, [values], function (err, result) {
      if (err) {
        console.log(err);
        return err;
      }
      return { Secret: key512Bits1000Iterations };
    });
  });
}

module.exports = { CraftSignature };
