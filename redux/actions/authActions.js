// Login
export const login = (
  _id,
  fName,
  lName,
  phone,
  stellarPublicKey,
  serverPublicKey,
) => ({
  type: 'LOGIN',
  _id: _id,
  FName: fName,
  LName: lName,
  Phone: phone,
  serverPublicKey: serverPublicKey,
  stellarPublicKey: stellarPublicKey,
});
