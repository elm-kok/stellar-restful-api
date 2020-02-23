const StellarSdk = require("stellar-sdk");
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const crypto = require("crypto");

const PublicKey = "GASRGGYGQKU37DI537C4LZZRDA5RVL4DLVG4WKJUO4DTOAALGGU3X4NL";
const SecretKey = "SAKBRQ345WYCSPLSD72ULTCUAAXAEVOLC63SHQ7WB3RRSPM72TZSAFND";
const HOSPCODE = "10739";

function decrypt(text, ENCRYPTION_KEY) {
  try {
    let encryptedText = Buffer.from(text, "base64");
    let decipher = crypto.createDecipher(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY)
    );
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (err) {
    return null;
  }
}
function verifySignature(publicKey, signature, pid, key) {
  /*
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  */
  try {
    const kp = StellarSdk.Keypair.fromPublicKey(publicKey);
    return kp.verify(
      Buffer.from(pid + "_" + publicKey + "_" + key),
      Buffer.from(signature, "base64")
    );
  } catch (err) {
    console.log(err);
    return false;
  }
  // data -> 111...11_01/02/2020
}

async function getInfoByKey(publicKey, secretKey, key) {
  testAccountInit(publicKey);
  var resultOb = {};
  var result = new Set();
  await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(function(accountResult) {
      var i;
      for (i = 0; i < 16; ++i) {
        if (accountResult.data_attr[key + "_" + i.toString()]) {
          if (resultOb[key] == undefined) {
            resultOb[key] = "";
          }
          resultOb[key] += Buffer.from(
            accountResult.data_attr[key + "_" + i.toString()],
            "base64"
          ).toString("binary");
        } else {
          const deRes = decrypt(resultOb[key], secretKey);
          if (deRes) {
            result.add(deRes);
          }
          break;
        }
      }
    })
    .catch(function(err) {
      console.error(err);
    });
  return result;
}

async function getInfo(publicKey, secretKey) {
  console.log("Public Key: ", publicKey);
  console.log("Secret Key: ", secretKey);
  var resultOb = {};
  var result = new Set();
  await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(function(accountResult) {
      Object.keys(accountResult.data_attr)
        //.sort()
        .forEach(function(key) {
          if (resultOb[key.split("_")[0]] == undefined) {
            resultOb[key.split("_")[0]] = "";
          }
          resultOb[key.split("_")[0]] += Buffer.from(
            accountResult.data_attr[key],
            "base64"
          ).toString("binary");
        });
      Object.keys(resultOb)
        .sort()
        .forEach(function(key) {
          const result_dec = decrypt(resultOb[key], secretKey);
          if (result_dec != undefined) {
            result.add(result_dec);
          }
        });
    })
    .catch(function(err) {
      console.error(err);
    });
  return result;
}

module.exports = {
  PublicKey,
  SecretKey,
  HOSPCODE,
  verifySignature,
  getInfo,
  getInfoByKey
};
