const StellarSdk = require('stellar-sdk');
import {createCipher, createDecipher} from 'crypto';
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const apiServer = 'http://10.202.198.95:3000';

async function testAccountInit(publicKey) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
    );
    const responseJSON = await response.json();
    console.log('SUCCESS! You have a new account :)\n', responseJSON);
  } catch (e) {
    console.error('ERROR!', e);
  }
}
function encrypt(text, ENCRYPTION_KEY) {
  let cipher = createCipher('aes-256-cbc', Buffer.from(ENCRYPTION_KEY));
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('base64');
}

function decrypt(text, ENCRYPTION_KEY) {
  try {
    let encryptedText = Buffer.from(text, 'base64');
    let decipher = createDecipher('aes-256-cbc', Buffer.from(ENCRYPTION_KEY));
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (err) {
    console.log(err);
    return null;
  }
}
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
  console.log('Data: ', data);
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);
  console.log('Secret Key: ', secretKey);
  testAccountInit(publicKey);

  const key = hashToInt32(data + secretKey.toString());
  const strEncrypt = encrypt(data, secretKey);
  const content = chunkString(strEncrypt, 63);
  console.log('Contents: ', content);
  const account = await server.loadAccount(publicKey);
  const seq = account.sequenceNumber();
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
      .setTimeout(300)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(secretString));
    try {
      const transactionResult = await server.submitTransaction(transaction);
      //console.log(transactionResult);
    } catch (err) {
      console.error(err);
    }
  }
  console.log('Finish.');
}

export async function getInfo(publicKey, secretKey) {
  testAccountInit(publicKey);
  var resultOb = {};
  var result = new Set();
  await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(function(accountResult) {
      Object.keys(accountResult.data_attr).forEach(function(key) {
        if (resultOb[key.split('_')[0]] == undefined) {
          resultOb[key.split('_')[0]] = '';
        }
        resultOb[key.split('_')[0]] += Buffer.from(
          accountResult.data_attr[key],
          'base64',
        ).toString('binary');
      });

      Object.keys(resultOb)
        .sort()
        .forEach(function(key) {
          const deRes = decrypt(resultOb[key], secretKey);
          if (deRes) {
            result.add(deRes);
          }
        });
    })
    .catch(function(err) {
      console.error(err);
    });
  return result;
}
export {StellarSdk, server, apiServer};
