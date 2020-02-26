import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import {StellarSdk, apiServer} from '../stellar';
import {cos} from 'react-native-reanimated';

export async function fetchByPatient() {
  try {
    const hospitals = store.getState().hospitalReducer.HospitalList;
    const spk = store.getState().authReducer.stellarPublicKey;
    const secretKey = (await Keychain.getGenericPassword('StellarSecret'))
      .password;
    const KP = StellarSdk.Keypair.fromSecret(secretKey);
    var results = {DRUG_OPD: [], DRUGALLERGY: [], LAB: []};
    var i;

    for (i = 0; i < hospitals.length; ++i) {
      // await fetch(hospitals[i].endPoint + 'fetchByPatient', {
      await fetch(apiServer + 'fetchByPatient/', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SPK: spk,
          Signature: KP.sign(
            Buffer.from(spk + '_' + hospitals[i].hospCode),
          ).toString('base64'),
        }),
      })
        .then(async response => response.json())
        .then(async responseJson => {
          results.DRUG_OPD.push(...responseJson.DRUG_OPD);
          results.LAB.push(...responseJson.LAB);
          results.DRUGALLERGY.push(...responseJson.DRUGALLERGY);
          return results
        });
    }
    return results;
  } catch (e) {
    console.log(e);
    return 'DSA';
  }
}
