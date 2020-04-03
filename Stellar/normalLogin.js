const StellarSdk = require('stellar-sdk');
const request = require('request-promise');
const crypto = require('crypto');
const fs = require('fs');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const {PerformanceObserver, performance} = require('perf_hooks');

num_account = 100;
num_payload = 1;
record_len = 63 * 3;
all_key = num_account * num_payload;

async function cleanAccountByKey(publicKey, secretKey, Key) {
  const account = await server.loadAccount(publicKey);
  const fee = await server.fetchBaseFee();
  const isFail = await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(async function (accountResult) {
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.manageData({
            name: Key,
            value: null,
          }),
        )
        .setTimeout(600)
        .build();
      transaction.sign(StellarSdk.Keypair.fromSecret(secretKey));
      try {
        await server.submitTransaction(transaction);
      } catch (err) {
        console.error(err);
        return false;
      }
      return true;
    });
  if (isFail) console.log(Key + ' has been removed.');
  return isFail;
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
      console.log(Math.round((i * 100) / num_account), '%');
      let r = makeid(10);
      const hashId = crypto.createHash('sha256').update(r).digest();
      const arrByte = Uint8Array.from(hashId);
      const stellarKeyPair = await StellarSdk.Keypair.fromRawEd25519Seed(
        arrByte,
      );
      var total_infn = await request(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
          stellarKeyPair.publicKey(),
        )}`,
      )
        .then(async function (htmlString) {
          accountL['users'].push({
            publicKey: stellarKeyPair.publicKey(),
            secret: stellarKeyPair.secret(),
          });
          ++i;
          const obs = new PerformanceObserver((items) => {
            console.log(items.getEntries()[0].duration);
            performance.clearMarks();
            const path =
              'Login_' +
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
          const total_infn = await server
            .accounts()
            .accountId(stellarKeyPair.publicKey())
            .call()
            .then(async function (accountResult) {
              var c = 0;
              for (const key of Object.keys(accountResult.data_attr)) {
                var isFail = false;
                while (!isFail) {
                  isFail = await cleanAccountByKey(
                    stellarKeyPair.publicKey(),
                    stellarKeyPair.secret(),
                    key,
                  );
                  ++c;
                }
              }
              return c ? c : 1;
            })
            .catch(function (err) {
              console.log(err);
            });
          performance.mark('B');
          performance.measure('A to B', 'A', 'B');
          return total_infn;
        })
        .catch(function (err) {
          console.error(err);
        });
      total += total_infn;
    }
    let data = JSON.stringify(accountL);
    fs.writeFileSync('accountListLogin.json', data);
    const path =
      'FLogin_' +
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
        total.toString() + '_' + all_key.toString() + '\n',
      );
    } else {
      fs.writeFileSync(
        path,
        total.toString() + '_' + all_key.toString() + '\n',
      );
    }
  } catch (e) {}
})();
