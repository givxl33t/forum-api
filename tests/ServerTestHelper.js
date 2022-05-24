/* istanbul ignore file */
const UsersTableTestHelper = require('./UsersTableTestHelper');
const Jwt = require('@hapi/jwt');

const ServerTestHelper = {
  async generateAccessToken() {
    const userPayload = {
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    await UsersTableTestHelper.addUser(userPayload);
    return Jwt.token.generate(userPayload, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = ServerTestHelper;