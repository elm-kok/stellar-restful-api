export const addDoctor = (seq_sig, name, date) => ({
  type: 'AddDoctor',
  seq_sig: seq_sig,
  name: name,
  date: date,
});

export const updateDoctor = doctorList => ({
  type: 'UpdateDoctor',
  doctorList: doctorList,
});
