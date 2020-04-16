const StellarSdk = require("stellar-sdk");
const request = require("request-promise");
const crypto = require("crypto");
const fs = require("fs");
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const { PerformanceObserver, performance } = require("perf_hooks");

const record_len = 63 * 3;
const num_payload = 1;

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

async function getInfo(publicKey, secretKey) {
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
      return [...result];
    });
  return result;
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

(async () => {
  try {
    var accountL = JSON.parse(
      fs.readFileSync("accountListHospital.json", "utf8")
    )["users"];
    console.log("number of users : ", accountL.length);
    const num_account = accountL.length;
    const all_key = num_account * num_payload;
    let i = 0;
    let total = 0;
    while (i < num_account) {
      console.log(Math.round((i * 100) / num_account), "%");
      let j = 0;
      let stellarKeyPair = StellarSdk.Keypair.fromSecret(accountL[i]["secret"]);
      //console.time('accountTest');
      const obs = new PerformanceObserver((items) => {
        console.log(items.getEntries()[0].duration);
        performance.clearMarks();
        const path =
          "FetchDecrypt_" +
          new Date().getDate() +
          "-" +
          new Date().getMonth() +
          "-" +
          new Date().getFullYear() +
          "_" +
          num_payload.toString() +
          "_" +
          record_len.toString() +
          "_" +
          ".txt";
        if (fs.existsSync(path)) {
          fs.appendFileSync(
            path,
            items.getEntries()[0].duration.toString() + "\n"
          );
        } else {
          console.log("create file.");
          fs.writeFileSync(
            path,
            items.getEntries()[0].duration.toString() + "\n"
          );
        }
        obs.disconnect();
      });
      obs.observe({ entryTypes: ["measure"] });
      performance.mark("A");
      const account = await server.loadAccount(stellarKeyPair.publicKey());
      while (j < num_payload) {
        let result = await getInfo(
          stellarKeyPair.publicKey(),
          accountL[i]["secretKey"]
        );
        if (result) {
          ++j;
        }
        total++;
      }
      //console.timeEnd('accountTest');
      performance.mark("B");
      performance.measure("A to B", "A", "B");
      ++i;
    }
    const path =
      "FfetchDecrypt_" +
      new Date().getDate() +
      "-" +
      new Date().getMonth() +
      "-" +
      new Date().getFullYear() +
      "_" +
      num_payload.toString() +
      "_" +
      record_len.toString() +
      "_" +
      ".txt";
    if (fs.existsSync(path)) {
      fs.appendFileSync(
        path,
        total.toString() + "_" + all_key.toString() + "\n"
      );
    } else {
      fs.writeFileSync(
        path,
        total.toString() + "_" + all_key.toString() + "\n"
      );
    }
  } catch (e) {
    console.log(e);
  }
})();
