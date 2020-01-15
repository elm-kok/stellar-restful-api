var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var apiServer = 'http://10.202.221.160:3000'
export {StellarSdk, server, apiServer};
