const { getResponse, truncateDatabase } = require('..//utils/app');
const { buildUser, createUser } = require('../factories/users');
const { User } = require('../../app/models');
const { hashPassword } = require('../../app/services/bcrypt');
const { EXPECTED_KEY_ERRORS } = require('../utils/constants');

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
  describe('Fail for already exist user', () => {
    let alreadyExistResponse = {};
    beforeAll(async () => {
      await truncateDatabase();
      const {
        dataValues: { password, email }
      } = await buildUser();
      const hashedPassword = await hashPassword(password);
      await createUser({ password: hashedPassword, email });
      alreadyExistResponse = await getResponse({
        endpoint: '/users',
        method: 'post',
        body: { password, email }
      });
    });
    it('Should return status code 400', () => {
      expect(alreadyExistResponse.statusCode).toEqual(400);
    });
    it('Should return the correct error keys in body', () => {
      expect(Object.keys(alreadyExistResponse.body)).toStrictEqual(
        expect.arrayContaining(EXPECTED_KEY_ERRORS)
      );
    });
    it('Should return internal_code already_exist', () => {
      expect(alreadyExistResponse.body.internal_code).toBe('already_exist');
    });
    it('Should return an error indicating the provided user already exist', () => {
      expect(alreadyExistResponse.body.message).toBe('The provided user already exist');
    });
  });
  describe('Fail for empty body', () => {
    let emptyBodyResponse = {};
    beforeAll(async () => {
      emptyBodyResponse = await getResponse({
        endpoint: '/users',
        method: 'post'
      });
    });
    it('Should return status code 409', () => {
      expect(emptyBodyResponse.statusCode).toEqual(409);
    });
    it('Should return the correct error keys in body', () => {
      expect(Object.keys(emptyBodyResponse.body)).toStrictEqual(expect.arrayContaining(EXPECTED_KEY_ERRORS));
    });
    it('Should return internal_code invalid_params', () => {
      expect(emptyBodyResponse.body.internal_code).toBe('invalid_params');
    });
    it('Should return an error indicating the provided email is not valid', () => {
      expect(emptyBodyResponse.body.message).toContain(
        'email must be string, not empty and must be contained in body'
      );
    });
    it('Should return an error indicating the provided password is not valid', () => {
      expect(emptyBodyResponse.body.message).toContain(
        'password must be string, not empty and must be contained in body'
      );
    });
  });
  describe('Fail for empty strings in body', () => {
    let invalidParamsResponse = {};
    beforeAll(async () => {
      invalidParamsResponse = await getResponse({
        endpoint: '/users',
        method: 'post',
        body: { user: '', password: '' }
      });
    });
    it('Should return status code 409', () => {
      expect(invalidParamsResponse.statusCode).toEqual(409);
    });
    it('Should return the correct error keys in body', () => {
      expect(Object.keys(invalidParamsResponse.body)).toStrictEqual(
        expect.arrayContaining(EXPECTED_KEY_ERRORS)
      );
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

describe('POST /users/login', () => {
  describe('Successful response', () => {
    let successfulResponse = {};
    const jwtRegex = new RegExp(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    beforeAll(async () => {
      await truncateDatabase();
      const {
        dataValues: { password, email }
      } = await buildUser();
      const hashedPassword = await hashPassword(password);
      await createUser({ password: hashedPassword, email });
      successfulResponse = await getResponse({
        endpoint: '/users/login',
        method: 'post',
        body: { password, email }
      });
    });
    it('Should return status code 200', () => {
      expect(successfulResponse.statusCode).toEqual(200);
    });
    it('Should return a token in body', () => {
      expect(successfulResponse.body.token).toMatch(jwtRegex);
    });
  });
  describe('Fail for invalid credentials', () => {
    let invalidCredentialsResponse = {};
    beforeAll(async () => {
      await truncateDatabase();
      const {
        dataValues: { password, email }
      } = await buildUser();
      const hashedPassword = await hashPassword(password);
      await createUser({ password: hashedPassword, email });
      invalidCredentialsResponse = await getResponse({
        endpoint: '/users/login',
        method: 'post',
        body: { password: 'wrong password', email }
      });
    });
    it('Should return status code 400', () => {
      expect(invalidCredentialsResponse.statusCode).toEqual(400);
    });
    it('Should return the correct error keys in body', () => {
      expect(Object.keys(invalidCredentialsResponse.body)).toStrictEqual(
        expect.arrayContaining(EXPECTED_KEY_ERRORS)
      );
    });
    it('Should return internal_code invalid_credentials', () => {
      expect(invalidCredentialsResponse.body.internal_code).toBe('invalid_credentials');
    });
    it('Should return an error indicating the provided credentials is not valid', () => {
      expect(invalidCredentialsResponse.body.message).toBe('The provided credentials are invalid');
    });
  });
  describe('Fail for user not found', () => {
    let userNotFoundResponse = {};
    beforeAll(async () => {
      userNotFoundResponse = await getResponse({
        endpoint: '/users/login',
        method: 'post',
        body: { password: 'secret-password', email: 'nonExistent@email.com' }
      });
    });
    it('Should return status code 404', () => {
      expect(userNotFoundResponse.statusCode).toEqual(404);
    });
    it('Should return the correct error keys in body', () => {
      expect(Object.keys(userNotFoundResponse.body)).toStrictEqual(
        expect.arrayContaining(EXPECTED_KEY_ERRORS)
      );
    });
    it('Should return internal_code not_found', () => {
      expect(userNotFoundResponse.body.internal_code).toBe('not_found');
    });
    it('Should return an error indicating the provided email no matched with any user', () => {
      expect(userNotFoundResponse.body.message).toBe('The provided user was not found');
    });
  });
  describe('Fail for empty strings in body', () => {
    let invalidParamsResponse = {};
    beforeAll(async () => {
      invalidParamsResponse = await getResponse({
        endpoint: '/users/login',
        method: 'post',
        body: { user: '', password: '' }
      });
    });
    it('Should return status code 409', () => {
      expect(invalidParamsResponse.statusCode).toEqual(409);
    });
    it('Should return the correct error keys in body', () => {
      expect(Object.keys(invalidParamsResponse.body)).toStrictEqual(
        expect.arrayContaining(EXPECTED_KEY_ERRORS)
      );
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
