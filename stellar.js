var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var apiServer = 'http://10.202.131.127:3000';

export async function submit(publicKey, secretString, data) {
  console.log('Data: ', data);
  console.log('Pub: ', publicKey);
  console.log('Pri: ', secretString);

  const account = await server.loadAccount(publicKey);
  const fee = await server.fetchBaseFee();
  console.log('Build.');
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      // this operation funds the new account with XLM
      StellarSdk.Operation.manageData({
        name: '15',
        value: data.toString('binary'),
      }),
    )
    .setTimeout(300)
    .build();
  console.log('Sign');
  transaction.sign(StellarSdk.Keypair.fromSecret(secretString));
  console.log('Send.');
  try {
    const transactionResult = await server.submitTransaction(transaction);
    console.log(transactionResult);
  } catch (err) {
    console.error(err);
  }
  console.log('Finish.');
}

export {StellarSdk, server, apiServer};
