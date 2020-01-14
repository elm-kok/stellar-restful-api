// Login
export const login = (_id, stellarPublicKey, serverPublicKey) => ({
  type: 'LOGIN',
  _id: _id,
  serverPublicKey: serverPublicKey,
  stellarPublicKey: stellarPublicKey,
});
