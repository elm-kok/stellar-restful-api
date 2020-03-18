export const addHospital = (
  seq_sig,
  seq_end,
  name,
  hospcode,
  endpoint,
  date,
) => ({
  type: 'AddHospital',
  seq_sig: seq_sig,
  seq_end: seq_end,
  name: name,
  hospcode: hospcode,
  endpoint: endpoint,
  date: date,
});

export const updateHospital = hospitalList => ({
  type: 'UpdateHospital',
  hospitalList: hospitalList,
});
