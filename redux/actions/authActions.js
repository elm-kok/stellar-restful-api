// Login
export const login = (
  _id,
  fName,
  lName,
  stellarPublicKey,
) => ({
  type: 'LOGIN',
  _id: _id,
  FName: fName,
  LName: lName,
  stellarPublicKey: stellarPublicKey,
});