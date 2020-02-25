export async function fetchByPatient(hospitals, signature, spk) {
  var results = {DRUG_OPD: [], DRUGALLERGY: [], LAB: []};
  var i;
  for (i = 0; i < hospitals.length; ++i) {
    try {
      await fetch(hospitals[i].endPoint, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SPK: spk,
          Signature: signature,
        }),
      })
        .then(response => response.json())
        .then(async responseJson => {
          results.DRUG_OPD.push(responseJson.DRUG_OPD);
          results.LAB.push(responseJson.LAB);
          results.DRUGALLERGY.push(responseJson.DRUGALLERGY);
        });
      return results;
    } catch (e) {
      console.log('ERROR!', e);
    }
  }
}
