const StellarSdk = require("stellar-sdk");
const request = require("request-promise");
const crypto = require("crypto");
const fs = require("fs");
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const { PerformanceObserver, performance } = require("perf_hooks");

const record_len = 63 * 3;
const num_payload = 1;

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
      fs.readFileSync("accountListDoctor.json", "utf8")
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
          "Fetch_" +
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
      let seq = account.sequenceNumber() - 3;
      while (j < num_payload) {
        let result = await getInfoByKeyWithoutEncrypt(
          stellarKeyPair.publicKey(),
          seq
        );
        if (result) {
          ++j;
          seq -= 3;
        }
        total++;
      }
      //console.timeEnd('accountTest');
      performance.mark("B");
      performance.measure("A to B", "A", "B");
      ++i;
    }
    const path =
      "Ffetch_" +
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
