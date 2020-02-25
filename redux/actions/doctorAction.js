export const addDoctor = (seq_sig, name) => ({
  type: 'AddDoctor',
  seq_sig: seq_sig,
  DoctorName: name,
});

export const updateDoctor = doctorList => ({
  type: 'UpdateDoctor',
  doctorList: doctorList,
});
