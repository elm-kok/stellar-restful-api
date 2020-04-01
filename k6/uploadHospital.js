const StellarSdk = require('stellar-sdk');
const request = require('request-promise');
const crypto = require('crypto');
const fs = require('fs');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const {PerformanceObserver, performance} = require('perf_hooks');

num_account = 100;
num_payload = 2;
record_len = 63 * 3;
all_key = num_account * num_payload;
async function submitWithoutEncrypt(
  publicKey,
  secretString,
  data,
  seq,
  account,
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
          name: seq + '_' + i.toString(),
          value: content[i].toString('binary'),
        }),
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
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  } catch (err) {
    console.log(err);
    return null;
  }
}
function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

(async () => {
  try {
    let accountL = {users: []};
    let i = 0;
    let total = 0;
    while (i < num_account) {
      let j = 0;
      console.log(Math.round((i * 100) / num_account), '%');
      let r = makeid(10);
      const hashId = crypto
        .createHash('sha256')
        .update(r)
        .digest();
      const arrByte = Uint8Array.from(hashId);
      const stellarKeyPair = await StellarSdk.Keypair.fromRawEd25519Seed(
        arrByte,
      );
      await request(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
          stellarKeyPair.publicKey(),
        )}`,
      )
        .then(async function(htmlString) {
          accountL['users'].push({
            publicKey: stellarKeyPair.publicKey(),
            secret: stellarKeyPair.secret(),
          });
          ++i;
          //console.time('accountTest');
          const obs = new PerformanceObserver(items => {
            console.log(items.getEntries()[0].duration);
            performance.clearMarks();
            const path =
              'Upload_' +
              new Date().getDate() +
              '-' +
              new Date().getMonth() +
              '-' +
              new Date().getFullYear() +
              '_' +
              num_payload.toString() +
              '_' +
              record_len.toString() +
              '_' +
              '.txt';
            if (fs.existsSync(path)) {
              fs.appendFileSync(
                path,
                items.getEntries()[0].duration.toString() + '\n',
              );
            } else {
              console.log('create file.');
              fs.writeFileSync(
                path,
                items.getEntries()[0].duration.toString() + '\n',
              );
            }
            obs.disconnect();
          });
          obs.observe({entryTypes: ['measure']});
          performance.mark('A');
          const account = await server.loadAccount(stellarKeyPair.publicKey());
          let seq = account.sequenceNumber();
          while (j < num_payload) {
            let result = await submitWithoutEncrypt(
              stellarKeyPair.publicKey(),
              stellarKeyPair.secret(),
              makeid(record_len),
              seq,
              account,
            );
            if (result) {
              ++j;
              seq = account.sequenceNumber();
            }
            total++;
          }
          //console.timeEnd('accountTest');
          performance.mark('B');
          performance.measure('A to B', 'A', 'B');
        })
        .catch(function(err) {
          console.error(err);
        });
    }
    let data = JSON.stringify(accountL);
    fs.writeFileSync('accountListHospital.json', data);
    const path =
      'FUpload_' +
      new Date().getDate() +
      '-' +
      new Date().getMonth() +
      '-' +
      new Date().getFullYear() +
      '_' +
      num_payload.toString() +
      '_' +
      record_len.toString() +
      '_' +
      '.txt';
    if (fs.existsSync(path)) {
      fs.appendFileSync(
        path,
        total.toString() +
          '_' +
          all_key.toString() +
          '\n',
      );
    } else {
      fs.writeFileSync(
        path,
        total.toString() +
          '_' +
          all_key.toString() +
          '\n',
      );
    }
  } catch (e) {}
})();
