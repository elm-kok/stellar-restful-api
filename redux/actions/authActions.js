// Login
export const login = (_id, passwd, pri, pub) => ({
  type: 'LOGIN',
  _id: _id,
  passwd: passwd,
  pri: pri,
  pub: pub,
});
