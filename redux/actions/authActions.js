// Login
export const login = (
  _id,
  fName,
  lName,
  phone,
  serverPublicKey,
  stellarPublicKey,
) => ({
  type: 'LOGIN',
  _id: _id,
  FName: fName,
  LName: lName,
  Phone: phone,
  serverPublicKey: serverPublicKey,
  stellarPublicKey: stellarPublicKey,
});
