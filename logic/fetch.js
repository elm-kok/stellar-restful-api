import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import {StellarSdk, apiServer, getInfo} from '../stellar';

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
      //await fetch(hospitals[i].endPoint + 'fetchByPatient', {
      await fetch(apiServer + 'fetchByPatient/', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SPK: spk,
          HospCode: hospitals[i].hospcode,
          Signature: KP.sign(
            Buffer.from(spk + '_' + hospitals[i].hospcode),
          ).toString('base64'),
        }),
      })
        .then(async (response) => response.json())
        .then(async (responseJson) => {
          results.DRUG_OPD.push(...responseJson.DRUG_OPD);
          results.LAB.push(...responseJson.LAB);
          results.DRUGALLERGY.push(...responseJson.DRUGALLERGY);
          return results;
        });
    }
    return results;
  } catch (e) {
    console.log('Fail to fetch the record: ' + e);
    return null;
  }
}

export async function fetchByDoctor(patientSPK, secret, seq) {
  try {
    const spk = store.getState().authReducer.stellarPublicKey;
    const secretKey = (await Keychain.getGenericPassword('StellarSecret'))
      .password;
    const KP = StellarSdk.Keypair.fromSecret(secretKey);
    var results = {DRUG_OPD: [], DRUGALLERGY: [], LAB: []};
    const pat_info = await getInfo(patientSPK, secret);
    //pat_info.forEach(async item => {
    for (let item of pat_info) {
      const json_item = JSON.parse(item);
      await fetch(apiServer + 'fetchByDoctor/', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DoctorSPK: spk,
          PatientSPK: patientSPK,
          HospCode: json_item.HOSPCODE,
          SEQ: seq,
          DoctorSignature: KP.sign(Buffer.from(patientSPK)).toString('base64'),
          HospitalSignature: KP.sign(
            Buffer.from(patientSPK + '_' + json_item.HOSPCODE),
          ).toString('base64'),
        }),
      })
        .then(async (response) => response.json())
        .then(async (responseJson) => {
          results.DRUG_OPD.push(...responseJson.DRUG_OPD);
          results.LAB.push(...responseJson.LAB);
          results.DRUGALLERGY.push(...responseJson.DRUGALLERGY);
          return results;
        });
    }
    return results;
  } catch (e) {
    console.log('Fail to fetch the record: ' + e);
    return null;
  }
}
