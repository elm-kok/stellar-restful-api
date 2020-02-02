const mysql = require("mysql");
const dotenv = require("dotenv").config();

export function InsertSecretKey(cid, spk, secretkey) {
  const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    port: 3306
  });

  console.log("Connecting...");
  connection.connect(function(err) {
    if (err) return new Error("An error occured during SQL connection " + err);
    console.log("Connected!");
  });
  console.log(connection.config);

  var sql = "INSERT INTO STELLARKEY (CID, HOSPCODE, SPK, SecretKey) VALUES ?";
  var values = [[cid, HOSPCODE, spk, secretkey]];
  connection.query(sql, [values], function(err, result) {
    if (err) throw err;
  });
}
