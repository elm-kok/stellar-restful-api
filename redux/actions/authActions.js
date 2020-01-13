// Login
export const login = (_id, passwd) => ({
  type: 'LOGIN',
  _id: _id,
  passwd: passwd,
});
