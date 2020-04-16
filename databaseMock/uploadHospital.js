const StellarSdk = require("stellar-sdk");
const request = require("request-promise");
const crypto = require("crypto");
const fs = require("fs");
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

const num_account = 2;
const HOSPCODE = "09082";
const HOSPNAME = "Siriraj Hospital";
const SecretKey = "SAKBRQ345WYCSPLSD72ULTCUAAXAEVOLC63SHQ7WB3RRSPM72TZSAFND";
const KP = StellarSdk.Keypair.fromSecret(SecretKey);
const doctor = {
  publicKey: "GDGIKEGHH6W5YZ65F37OOA5CAKYCNOTD4DZUKRFVUMSFPXRSEU3VWZZJ",
  secretKey: "SB2Y6XPSG2FLT7HQZAQGXN3P37LBTJYDDIFZ57LW6FQSBA7KYHX4KJTD",
};
const KPdoctor = StellarSdk.Keypair.fromSecret(doctor.secretKey);

function encrypt(text, ENCRYPTION_KEY) {
  let cipher = crypto.createCipher("aes-256-cbc", Buffer.from(ENCRYPTION_KEY));
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("base64");
}

async function submit(publicKey, secretString, data, secretKey, seq, account) {
  const strEncrypt = encrypt(data, secretKey);
  const content = chunkString(strEncrypt, 63);
  const fee = await server.fetchBaseFee();
  var i;
  for (i = 0; i < content.length; i++) {
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: seq + "_" + i.toString(),
          value: content[i].toString("binary"),
        })
      )
      .setTimeout(100)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(secretString));
    try {
      const transactionResult = await server.submitTransaction(transaction);
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return seq;
}
async function submitWithoutEncrypt(
  publicKey,
  secretString,
  data,
  seq,
  account
) {
  const content = chunkString(data, 63);
  const fee = await server.fetchBaseFee();
  var i;
  for (i = 0; i < content.length; i++) {
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: seq + "_" + i.toString(),
          value: content[i].toString("binary"),
        })
      )
      .setTimeout(100)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(secretString));
    try {
      const transactionResult = await server.submitTransaction(transaction);
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return seq;
}

function chunkString(str, length) {
  try {
    return str.match(new RegExp(".{1," + length + "}", "g"));
  } catch (err) {
    console.log(err);
    return null;
  }
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
    let accountL = { users: [] };
    let i = 0;
    while (i < num_account) {
      const keyDoctor = crypto.randomBytes(32).toString("base64");
      console.log(Math.round((i * 100) / num_account), "%");
      let r = makeid(63);
      const hashId = crypto.createHash("sha256").update(r).digest();
      const arrByte = Uint8Array.from(hashId);
      const stellarKeyPair = await StellarSdk.Keypair.fromRawEd25519Seed(
        arrByte
      );
      await request(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
          stellarKeyPair.publicKey()
        )}`
      )
        .then(async function (htmlString) {
          const account = await server.loadAccount(stellarKeyPair.publicKey());

          const hospSigSeq = account.sequenceNumber();
          const sig = KP.sign(
            Buffer.from(
              i.toString().padStart(4, "0") + "_" + stellarKeyPair.publicKey()
            )
          ).toString("base64");
          const key512Bits1000Iterations = crypto
            .pbkdf2Sync(sig, "", 1000, 64, "sha512")
            .toString("base64");

          await submitWithoutEncrypt(
            stellarKeyPair.publicKey(),
            stellarKeyPair.secret(),
            JSON.stringify({
              Signature: key512Bits1000Iterations,
              Status: 1,
            }),
            hospSigSeq,
            account
          );
          const hospInfoSeq = account.sequenceNumber();

          await submit(
            stellarKeyPair.publicKey(),
            stellarKeyPair.secret(),
            JSON.stringify({
              Type: "Hospital",
              Name: HOSPNAME,
              Endpoint: "http://localhost:3001/api/",
              HOSPCODE: HOSPCODE,
            }),
            keyDoctor,
            hospInfoSeq,
            account
          );

          const doctorSigSeq = account.sequenceNumber();
          await submitWithoutEncrypt(
            stellarKeyPair.publicKey(),
            stellarKeyPair.secret(),
            JSON.stringify({
              Signature: crypto
                .pbkdf2Sync(
                  KPdoctor.sign(
                    Buffer.from(stellarKeyPair.publicKey())
                  ).toString("base64"),
                  "",
                  1000,
                  64,
                  "sha512"
                )
                .toString("base64"),
              Status: 1,
            }),
            doctorSigSeq,
            account
          );

          accountL["users"].push({
            publicKey: stellarKeyPair.publicKey(),
            secret: stellarKeyPair.secret(),
            secretKey: keyDoctor,
            cid: i.toString().padStart(13, "0"),
            pid: i.toString().padStart(4, "0"),
            hospSigSeq: hospSigSeq,
            hospInfoSeq: hospInfoSeq,
            doctorSigSeq: doctorSigSeq,
            Signature: stellarKeyPair
              .sign(Buffer.from(stellarKeyPair.publicKey() + "_" + HOSPCODE))
              .toString("base64"),
            DoctorSignature: KPdoctor.sign(
              Buffer.from(stellarKeyPair.publicKey())
            ).toString("base64"),
            HospitalSignature: KPdoctor.sign(
              Buffer.from(stellarKeyPair.publicKey() + "_" + HOSPCODE)
            ).toString("base64"),
          });
          ++i;
        })
        .catch(function (err) {
          console.error(err);
        });
    }
    let data = JSON.stringify(accountL);
    fs.writeFileSync("PatientSPK.json", data);
  } catch (e) {}
})();
