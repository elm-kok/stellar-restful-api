// Login
export const login = (cid, fName, lName, stellarPublicKey, mode) => ({
  type: 'LOGIN',
  cid: cid,
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
