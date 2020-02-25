export const addHospital = (seq_sig, seq_end, name, hospcode, endPoint) => ({
  type: 'Add',
  seq_sig: seq_sig,
  seq_end: seq_end,
  HospitalName: name,
  hospCode: hospcode,
  HospitalEndPoint: endPoint,
});

export const updateHospital = hospitalList => ({
  type: 'Update',
  hospitalList: hospitalList,
});
