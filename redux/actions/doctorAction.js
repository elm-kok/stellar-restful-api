export const addDoctor = (seq_sig, name) => ({
  type: 'Add',
  seq_sig: seq_sig,
  DoctorName: name,
});

export const updateDoctor = doctorList => ({
  type: 'Update',
  doctorList: doctorList,
});
