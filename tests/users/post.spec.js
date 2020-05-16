const { getResponse, truncateDatabase } = require('..//utils/app');
const { buildUser } = require('../factories/users');
const { User } = require('../../app/models');

describe('POST /users', () => {
  describe('Successful response', () => {
    let successfulResponse = {};
    let usersCreated = {};
    beforeAll(async () => {
      await truncateDatabase();
      const {
        dataValues: { password, email }
      } = await buildUser();
      successfulResponse = await getResponse({
        endpoint: '/users',
        method: 'post',
        body: { password, email }
      });
      usersCreated = await User.findAll();
    });
    it('Should return status code 201', () => {
      expect(successfulResponse.statusCode).toEqual(201);
    });
    it('Should have only one user created', () => {
      expect(usersCreated.length).toBe(1);
    });
  });
  describe('Fail for invalid request', () => {
    let invalidParamsResponse = {};
    beforeAll(async () => {
      invalidParamsResponse = await getResponse({
        endpoint: '/users',
        method: 'post'
      });
    });
    it('Should return status code 409', () => {
      expect(invalidParamsResponse.statusCode).toEqual(409);
    });
    it('Should return internal_code invalid_params', () => {
      expect(invalidParamsResponse.body.internal_code).toBe('invalid_params');
    });
    it('Should return an error indicating the provided email is not valid', () => {
      expect(invalidParamsResponse.body.message).toContain(
        'email must be string, not empty and must be contained in body'
      );
    });
    it('Should return an error indicating the provided password is not valid', () => {
      expect(invalidParamsResponse.body.message).toContain(
        'password must be string, not empty and must be contained in body'
      );
    });
  });
});
