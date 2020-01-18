var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var apiServer = 'http://10.212.3.137:3000'

const submit = async (publicKey, secretString) =>{
const account = await server.loadAccount(publicKey);
const fee = await server.fetchBaseFee();
const transaction = new StellarSdk.TransactionBuilder(account, {fee})
    .addOperation(
      // this operation funds the new account with XLM
      StellarSdk.Operation.manageData({
        destination: 'GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW',
        asset: StellarSdk.Asset.native(),
        amount: '20000000',
      }),
    )
    .setTimeout(30)
    .build();
  transaction.sign(StellarSdk.Keypair.fromSecret(secretString));
  try {
    const transactionResult = await server.submitTransaction(transaction);
    console.log(transactionResult);
  } catch (err) {
    console.error(err);
  }
};

export {StellarSdk, server, apiServer,submit};
