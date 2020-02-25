const StellarSdk = require('stellar-sdk');
import {createCipher, createDecipher} from 'crypto';
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const apiServer = 'http://10.202.198.95:3000';
import {store} from './redux/store/store';
import * as Keychain from 'react-native-keychain';

const GodAccountSPK =
  'GDREKM4EFLY6RHZ3ORC6OLLEVLPY6HNA2IX5RANV22NXJUMBDSVN7RXZ';
const GodAccountSPVK =
  'SDGR6PNAT6DRUGP4KYQFU43WNGWVTD7EV7AB57CAI6EKSJXZXYV6HNLG';
export async function testAccountInit(publicKey) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
    );
    const responseJSON = await response.json();
    console.log('SUCCESS! You have a new account :)\n');
  } catch (e) {
    //console.error('ERROR!', e);
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

function chunkString(str, length) {
  try {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  } catch (err) {
    console.log(err);
    return null;
  }
}
export async function submitWithoutEncrypt(publicKey, secretString, data) {
  console.log('Data: ', data);
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);
  testAccountInit(publicKey);

  const content = chunkString(data, 63);
  console.log('Contents: ', content);
  const account = await server.loadAccount(publicKey);
  const seq = account.sequenceNumber();
  console.log('SEQ: ', seq);
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
      //console.log(transactionResult);
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  console.log('Finish.');
  return seq;
}

export async function submit(publicKey, secretString, data, secretKey) {
  console.log('Data: ', data);
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);
  console.log('Secret Key: ', secretKey);
  testAccountInit(publicKey);

  const strEncrypt = encrypt(data, secretKey);
  const content = chunkString(strEncrypt, 63);
  console.log('Contents: ', content);
  const account = await server.loadAccount(publicKey);
  const seq = account.sequenceNumber();
  console.log('SEQ: ', seq);
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
      //console.log(transactionResult);
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  console.log('Finish.');
  return seq;
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
export async function submitByKeyWithoutEncrypt(
  publicKey,
  secretString,
  data,
  key,
) {
  console.log('Data: ', data);
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);
  console.log('Seq: ', key);
  testAccountInit(publicKey);

  var content = await chunkString(data, 63);
  console.log('Contents: ', content);
  const account = await server.loadAccount(publicKey);
  const seq = key;
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
  const isFail = await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(async function(accountResult) {
      var i;
      for (i = content.length; i < 16; ++i) {
        console.log('remove: ', seq + '_' + i.toString());
        if (accountResult.data_attr[key + '_' + i.toString()]) {
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
            const transactionResult = await server.submitTransaction(
              transaction,
            );
            //console.log(transactionResult);
          } catch (err) {
            console.error(err);
            return false;
          }
        }
      }
      console.log('Finish.');
      return true;
    });
  return isFail;
}
export async function submitByKey(
  publicKey,
  secretString,
  data,
  secretKey,
  key,
) {
  console.log('Data: ', data);
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);
  console.log('Secret Key: ', secretKey);
  console.log('Seq: ', key);
  testAccountInit(publicKey);

  const strEncrypt = encrypt(data, secretKey);
  var content = await chunkString(strEncrypt, 63);
  console.log('Contents: ', content);
  const account = await server.loadAccount(publicKey);
  const seq = key;
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
  const isFail = await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(async function(accountResult) {
      var i;
      for (i = content.length; i < 16; ++i) {
        console.log('remove: ', seq + '_' + i.toString());
        if (accountResult.data_attr[key + '_' + i.toString()]) {
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
            const transactionResult = await server.submitTransaction(
              transaction,
            );
            //console.log(transactionResult);
          } catch (err) {
            console.error(err);
            return false;
          }
        }
      }
      console.log('Finish.');
      return true;
    });
  return isFail;
}
export async function getInfoByKey(publicKey, secretKey, key) {
  testAccountInit(publicKey);
  var resultOb = {};
  var result = new Set();
  await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(function(accountResult) {
      var i;
      for (i = 0; i < 16; ++i) {
        if (accountResult.data_attr[key + '_' + i.toString()]) {
          if (resultOb[key] == undefined) {
            resultOb[key] = '';
          }
          resultOb[key] += Buffer.from(
            accountResult.data_attr[key + '_' + i.toString()],
            'base64',
          ).toString('binary');
        } else {
          const deRes = decrypt(resultOb[key], secretKey);
          if (deRes) {
            result.add(deRes);
          }
          break;
        }
      }
    })
    .catch(function(err) {
      console.error(err);
    });
  return result;
}
export async function getInfoByKeyWithoutEncrypt(publicKey, key) {
  testAccountInit(publicKey);
  var resultOb = {};
  var result = new Set();
  await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(function(accountResult) {
      var i;
      for (i = 0; i < 16; ++i) {
        if (accountResult.data_attr[key + '_' + i.toString()]) {
          if (resultOb[key] == undefined) {
            resultOb[key] = '';
          }
          resultOb[key] += Buffer.from(
            accountResult.data_attr[key + '_' + i.toString()],
            'base64',
          ).toString('binary');
        } else {
          result.add(resultOb[key]);
          break;
        }
      }
    })
    .catch(function(err) {
      console.error(err);
    });
  return result;
}
export async function clearInfo(publicKey, secretString, seq) {
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);
  testAccountInit(publicKey);

  const account = await server.loadAccount(publicKey);
  console.log('SEQ: ', seq);
  const fee = await server.fetchBaseFee();
  const isFail = await server
    .accounts()
    .accountId(publicKey)
    .call()
    .then(async function(accountResult) {
      var i;
      for (i = 0; i < 16; i++) {
        if (accountResult.data_attr[seq + '_' + i.toString()]) {
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
            .setTimeout(600)
            .build();
          transaction.sign(StellarSdk.Keypair.fromSecret(secretString));
          try {
            const transactionResult = await server.submitTransaction(
              transaction,
            );
            //console.log(transactionResult);
          } catch (err) {
            console.error(err);
            return false;
          }
        }
      }
      return true;
    });
  console.log('Finish.');
  return isFail;
}

export async function clearAll() {
  const publicKey = store.getState().authReducer.stellarPublicKey;
  const secretString = (await Keychain.getGenericPassword('StellarSecret'))
    .password;
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);

  var account = await server.loadAccount(publicKey);
  var fee = await server.fetchBaseFee();
  const transaction1 = new StellarSdk.TransactionBuilder(account, {
    fee,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: data,
        limit: '0',
      }),
    )
    .setTimeout(1000)
    .build();
  transaction1.sign(StellarSdk.Keypair.fromSecret(secretString));
  try {
    const transactionResult = await server.submitTransaction(transaction1);
    console.log('Finish change trust.');
  } catch (err) {
    console.log(err);
  }

  var account = await server.loadAccount(publicKey);
  var fee = await server.fetchBaseFee();
  const transaction2 = new StellarSdk.TransactionBuilder(account, {
    fee,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.accountMerge({
        destination: 'GBNC5V7N6DCXTB4GUYE4ZPJOGJ5ELK73YKC4XX5FZ4MJM4CT7ZT2Z6FW',
      }),
    )
    .setTimeout(1000)
    .build();
  transaction2.sign(StellarSdk.Keypair.fromSecret(secretString));
  try {
    const transactionResult = await server.submitTransaction(transaction2);
    console.log('Clear Finish.');
  } catch (err) {
    console.log(err);
  }
}
export {StellarSdk, server, apiServer};
