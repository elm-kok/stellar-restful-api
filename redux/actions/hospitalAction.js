export const addHospital = (seq, HospitalName, HospitalEndPoint) => ({
  type: 'Add',
  seq: seq,
  HospitalName: HospitalName,
  HospitalEndPoint: HospitalEndPoint,
});
