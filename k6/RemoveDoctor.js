const StellarSdk = require('stellar-sdk');
const request = require('request-promise');
const fs = require('fs');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const {PerformanceObserver, performance} = require('perf_hooks');

const record_len = 63 * 3;
const num_payload = 1;
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
          value: null,
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
    var accountL = JSON.parse(
      fs.readFileSync('accountListDoctor.json', 'utf8'),
    )['users'];
    console.log('number of users : ', accountL.length);
    const num_account = accountL.length;
    const all_key = num_account * num_payload;
    let i = 0;
    let total = 0;
    while (i < num_account) {
      console.log(Math.round((i * 100) / num_account), '%');
      let j = 0;
      let stellarKeyPair = StellarSdk.Keypair.fromSecret(accountL[i]['secret']);
      //console.time('accountTest');
      const obs = new PerformanceObserver(items => {
        console.log(items.getEntries()[0].duration);
        performance.clearMarks();
        const path =
          'Remove_' +
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
      let seq = account.sequenceNumber() - 3;
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
          seq -= 3;
        }
        total++;
      }
      //console.timeEnd('accountTest');
      performance.mark('B');
      performance.measure('A to B', 'A', 'B');
      ++i;
    }
    const path =
      'FRemove_' +
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
  } catch (e) {
    console.log(e);
  }
})();
