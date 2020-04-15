const StellarSdk = require("stellar-sdk");
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const crypto = require("crypto");

const PublicKey1 = "GASRGGYGQKU37DI537C4LZZRDA5RVL4DLVG4WKJUO4DTOAALGGU3X4NL";
const SecretKey1 = "SAKBRQ345WYCSPLSD72ULTCUAAXAEVOLC63SHQ7WB3RRSPM72TZSAFND";
const HOSPCODE1 = "09082";
const HOSPNAME1 = "Siriraj Hospital";

const PublicKey0 = "GC53Z7CHWUFWVJ7V4JQRNYR26PDQDHTKIG423Z6T47XJYLOCVKT7YTV5";
const SecretKey0 = "SCCXCBTECBWXYAJV2NVETV5G5ZEPUV2MPEDAJHPNS3G5ZZ3LAFSLMKZG";
const HOSPCODE0 = "10739";
const HOSPNAME0 = "Chulalongkorn Hospital";

const PublicKey = PublicKey1;
const SecretKey = SecretKey1;
const HOSPCODE = HOSPCODE1;
const HOSPNAME = HOSPNAME1;

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
}
function verifySignatureWithoutKey(publicKey, signature, raw) {
  try {
    const kp = StellarSdk.Keypair.fromPublicKey(publicKey);
    return kp.verify(Buffer.from(raw), Buffer.from(signature, "base64"));
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getInfoByKey(publicKey, secretKey, key) {
  var resultOb = {};
  var result = new Set();
  await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(function (accountResult) {
      var i;
      for (i = 0; i < 8; ++i) {
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
    .catch(function (err) {
      console.error(err);
      return [...result][0];
    });
  return result;
}

async function getInfoByKeyWithoutEncrypt(publicKey, key) {
  var resultOb = {};
  var result = new Set();
  await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(function (accountResult) {
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
          result.add(resultOb[key]);
          break;
        }
      }
    })
    .catch(function (err) {
      console.error(err);
      return [...result][0];
    });
  return [...result][0];
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
    .then(function (accountResult) {
      Object.keys(accountResult.data_attr)
        //.sort()
        .forEach(function (key) {
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
        .forEach(function (key) {
          const result_dec = decrypt(resultOb[key], secretKey);
          if (result_dec != undefined) {
            result.add(result_dec);
          }
        });
    })
    .catch(function (err) {
      console.error(err);
      return [...result][0];
    });
  return result;
}

module.exports = {
  PublicKey,
  SecretKey,
  HOSPCODE,
  HOSPNAME,
  verifySignature,
  getInfo,
  getInfoByKey,
  StellarSdk,
  server,
  verifySignatureWithoutKey,
  getInfoByKeyWithoutEncrypt,
};
