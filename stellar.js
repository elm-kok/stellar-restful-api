var StellarSdk = require('stellar-sdk');
import {createCipheriv} from 'crypto';
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var apiServer = 'http://10.202.131.127:3000';

function hashToInt32(str) {
  var hash = 5381,
    i = str.length;
  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}
function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}
export async function submit(publicKey, secretString, data, secretKey) {
  data = 'GDVFPJJD7JYT2A5FXXR6P7AEKL6N6L4AE63IBMX5I5CA3QYVA5J5Q5QW';
  console.log('Data: ', data);
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);

  const key = hashToInt32(data);

  var mykey = crypto.createCipher('aes-128-cbc', secretKey);
  var mystr = mykey.update(data, 'utf8', 'hex');
  mystr += mykey.final('hex');

  const content = chunkString(mystr, 31);

  const account = await server.loadAccount(publicKey);
  const fee = await server.fetchBaseFee();
  var i;
  for (i = 0; i < content.length; i++) {
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: key + '_' + i.toString(),
          value: content[i].toString('binary'),
        }),
      )
      .setTimeout(300)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(secretString));
    try {
      const transactionResult = await server.submitTransaction(transaction);
      console.log(transactionResult);
    } catch (err) {
      console.error(err);
    }
  }
  console.log('Finish.');
}

export {StellarSdk, server, apiServer};
