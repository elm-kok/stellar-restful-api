// Login
export const login = (_id, fName, lName, stellarPublicKey, mode) => ({
  type: 'LOGIN',
  _id: _id,
  FName: fName,
  LName: lName,
  stellarPublicKey: stellarPublicKey,
  mode: mode,
});

export const changeMode = mode => ({
  type: 'changeMode',
  mode: mode,
});

export const update = (fName, lName) => ({
  type: 'UPDATE',
  FName: fName,
  LName: lName,
});
