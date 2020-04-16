const StellarSdk = require("stellar-sdk");
const request = require("request-promise");
const crypto = require("crypto");
const fs = require("fs");

num_account = 10;

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length - 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

(async () => {
  try {
    let accountL = { users: [] };
    let i = 0;
    while (i < num_account) {
      console.log(Math.round((i * 100) / num_account), "%");
      let r = makeid(63);
      const hashId = crypto.createHash("sha256").update(r).digest();
      const arrByte = Uint8Array.from(hashId);
      const stellarKeyPair = await StellarSdk.Keypair.fromRawEd25519Seed(
        arrByte
      );
      i += await request(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
          stellarKeyPair.publicKey()
        )}`
      )
        .then(async function (htmlString) {
          accountL["users"].push({
            publicKey: stellarKeyPair.publicKey(),
            secret: stellarKeyPair.secret(),
            cid: str(i).zfill(13),
            hospSeq:hospSeq,
            hospCode:,
          });
          return 1;
        })
        .catch(function (err) {
          console.error(err);
          return 0;
        });
    }
    let data = JSON.stringify(accountL);
    fs.writeFileSync("accountListDoctor.json", data);
  } catch (e) {}
})();
