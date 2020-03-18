export const addPatient = (seq, name, spk, secretKey, date) => ({
  type: 'AddPatient',
  seq: seq,
  name: name,
  spk: spk,
  secretKey: secretKey,
  date: date,
});

export const updatePatient = patientList => ({
  type: 'UpdatePatient',
  patientList: patientList,
});
