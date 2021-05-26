import { gql } from 'apollo-server-express';
import EasyGraphQLTester from 'easygraphql-tester';
import faker from 'faker';
import fc from 'fast-check';
import { Connection, createConnection } from 'typeorm';
import { factory, useSeeding } from 'typeorm-seeding';
import { schema } from '../..';
import { ADMIN_CREATION_KEY } from '../../../config';
import { JWT_REG_EXP } from '../../../constants/regExp';
import {
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS,
} from '../../../constants/validation';
import SuperAdminEntity from '../../../database/entities/SuperAdmin';
import { UserRoleEnum } from '../../../database/entities/types';
import { testDbConfig } from '../../../ormconfig';
import {
  cExpect,
  expectErrorMsg,
  expectUnauthenticationError,
  FCInputGenerator,
  fcInvalidEmailInputGenerators,
  fcInvalidPasswordInputGenerators,
  fcTestForGraphqlInvalidInputs,
  mockReq,
  mockRes,
} from '../../../tests/utils';
import { SUPER_ADMIN_RESOLVER_ERR_MSGS } from '../resolvers';
import { SuperAdminAuth } from '../types';

const context: { [key: string]: unknown } = {
  req: mockReq,
  res: mockRes,
};

const SUPER_ADMIN_DATA = `
  id
  email
  createdTimeStamp
  role
`;

const SUPER_ADMIN_REGISTER = gql`
  mutation($registerInfo: SuperAdminRegisterInput!) {
    superAdminRegister(registerInfo: $registerInfo) {
      token
      superAdmin {
        ${SUPER_ADMIN_DATA}
      }
    }
  }
`;

const SUPER_ADMIN_LOGIN = gql`
  mutation($loginInfo: SuperAdminLoginInput!) {
    superAdminLogin(loginInfo: $loginInfo) {
      token
      superAdmin {
        ${SUPER_ADMIN_DATA}
      }
    }
  }
`;

const expectSuperAdminAuthData = (
  data: SuperAdminAuth,
  input: { [key: string]: unknown },
) => {
  cExpect(data).to.have.property('token').that.matches(JWT_REG_EXP);
  cExpect(data).to.have.property('superAdmin').that.is.a('object');
  cExpect(Number(data.superAdmin.id)).to.be.greaterThan(0);
  cExpect(data.superAdmin.email).to.equal(input.email);
  cExpect(data.superAdmin.role).to.equal(UserRoleEnum.SuperAdmin);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tester: any;
let connection: Connection | undefined;

const TEST_USER_CREDENTIALS = {
  email: faker.unique(faker.internet.email),
  password: faker.internet.password(),
};

let superAdminTestUser: SuperAdminEntity;

async function cleanUp() {
  if (connection?.isConnected) await connection.close();
}

describe('superadmin auth resolvers', () => {
  beforeAll(async () => {
    try {
      connection = await createConnection(testDbConfig);

      tester = new EasyGraphQLTester(schema);

      await useSeeding({
        connection: 'default',
      });

      // Add test user to DB
      superAdminTestUser = await factory(SuperAdminEntity)().create(
        TEST_USER_CREDENTIALS,
      );
    } catch (error) {
      await cleanUp();
      throw error;
    }
  });

  afterAll(async () => {
    await cleanUp();
  });

  describe('superAdminRegister', () => {
    const SUPER_ADMIN_REGISTER_INPUT = {
      email: faker.unique(faker.internet.email),
      password: faker.internet.password(6),
      key: ADMIN_CREATION_KEY,
    };

    type SuperAdminRegisterInputArgs = keyof typeof SUPER_ADMIN_REGISTER_INPUT;

    it('should fail to validate input args', async () => {
      const invalidInputGenerators: FCInputGenerator<SuperAdminRegisterInputArgs>[] = [
        {
          property: 'email',
          generators: fcInvalidEmailInputGenerators(),
        },
        {
          property: 'password',
          generators: fcInvalidPasswordInputGenerators(),
        },
        {
          property: 'key',
          generators: fc.oneof(fc.falsy()),
        },
      ];

      const validInputGenerators: FCInputGenerator<SuperAdminRegisterInputArgs>[] = [
        {
          property: 'email',
          generators: fc.emailAddress(),
        },
        {
          property: 'password',
          generators: fc.string({
            minLength: PASSWORD_MIN_CHARS,
            maxLength: PASSWORD_MAX_CHARS,
          }),
        },
        {
          property: 'key',
          generators: fc.string({ minLength: 1 }),
        },
      ];

      fcTestForGraphqlInvalidInputs({
        tester,
        validInputGenerators,
        invalidInputGenerators,
        resolver: SUPER_ADMIN_REGISTER,
        resolverArgumentName: 'registerInfo',
        context,
        assertParams: {
          examples: [
            // Registering exisiting user
            [
              superAdminTestUser?.email,
              SUPER_ADMIN_REGISTER_INPUT.password,
              SUPER_ADMIN_REGISTER_INPUT.key,
            ],
          ],
        },
      });
    });

    it('should fail to register superadmin and return unauthenticated error when an invalid key is used', async () => {
      const { data, errors } = await tester.graphql(
        SUPER_ADMIN_REGISTER,
        undefined,
        context,
        {
          registerInfo: {
            ...SUPER_ADMIN_REGISTER_INPUT,
            key: faker.random.alpha({ count: 6 }), // invalid key
          },
        },
      );

      cExpect(!data, JSON.stringify(data)).to.be.true;
      expectUnauthenticationError(errors);
    });

    it('should successfully register superadmin and return superadmin auth data', async () => {
      const { data, errors } = await tester.graphql(
        SUPER_ADMIN_REGISTER,
        undefined,
        context,
        {
          registerInfo: SUPER_ADMIN_REGISTER_INPUT,
        },
      );

      cExpect(!errors, JSON.stringify(errors)).to.be.true;
      cExpect(data?.superAdminRegister).to.be.a('object');
      expectSuperAdminAuthData(
        data.superAdminRegister,
        SUPER_ADMIN_REGISTER_INPUT,
      );
    });
  });

  describe('superAdminLogin', () => {
    it('should fail to validate input args', async () => {
      type LoginInputProps = 'email' | 'password';

      const invalidInputGenerators: FCInputGenerator<LoginInputProps>[] = [
        {
          property: 'email',
          generators: fcInvalidEmailInputGenerators(),
        },
        {
          property: 'password',
          generators: fcInvalidPasswordInputGenerators(),
        },
      ];

      const validInputGenerators: FCInputGenerator<LoginInputProps>[] = [
        {
          property: 'email',
          generators: fc.emailAddress(),
        },
        {
          property: 'password',
          generators: fc.string({
            minLength: PASSWORD_MIN_CHARS,
            maxLength: PASSWORD_MAX_CHARS,
          }),
        },
      ];

      fcTestForGraphqlInvalidInputs({
        tester,
        validInputGenerators,
        invalidInputGenerators,
        resolver: SUPER_ADMIN_LOGIN,
        resolverArgumentName: 'loginInfo',
        context,
      });
    });

    it("should fail and throw not found error when user doesn't exist", async () => {
      const { data, errors } = await tester.graphql(
        SUPER_ADMIN_LOGIN,
        undefined,
        context,
        {
          loginInfo: {
            email: faker.unique(faker.internet.email),
            password: faker.internet.password(6),
          },
        },
      );

      cExpect(!data, JSON.stringify(data)).to.be.true;
      expectErrorMsg(
        SUPER_ADMIN_RESOLVER_ERR_MSGS.accountNotFoundMatchingEmail,
        errors,
      );
    });

    it('should fail and throw inactive error when credentials are correct and account is inactive', async () => {
      // Create a inactive account
      const inactiveAccountInput = {
        password: faker.internet.password(),
        email: faker.unique(faker.internet.email),
        isActive: false,
      };

      await factory(SuperAdminEntity)().create(inactiveAccountInput);

      const { data, errors } = await tester.graphql(
        SUPER_ADMIN_LOGIN,
        undefined,
        context,
        {
          loginInfo: {
            email: inactiveAccountInput.email,
            password: inactiveAccountInput.password,
          },
        },
      );
      cExpect(!data, JSON.stringify(data)).to.be.true;
      expectErrorMsg(SUPER_ADMIN_RESOLVER_ERR_MSGS.accountNotActive, errors);
    });

    it('should fail and throw unauthenticated error when password is incorrect', async () => {
      const { data, errors } = await tester.graphql(
        SUPER_ADMIN_LOGIN,
        undefined,
        context,
        {
          loginInfo: {
            email: TEST_USER_CREDENTIALS.email,
            password: faker.internet.password(PASSWORD_MIN_CHARS + 1),
          },
        },
      );

      cExpect(!data, JSON.stringify(data)).to.be.true;
      expectUnauthenticationError(errors);
    });

    it('should succesfully validate credentials and return superadmin auth data', async () => {
      const { data, errors } = await tester.graphql(
        SUPER_ADMIN_LOGIN,
        undefined,
        context,
        {
          loginInfo: {
            email: TEST_USER_CREDENTIALS.email,
            password: TEST_USER_CREDENTIALS.password,
          },
        },
      );

      cExpect(!errors, JSON.stringify(errors)).to.be.true;
      cExpect(data?.superAdminLogin).to.be.a('object');
      expectSuperAdminAuthData(data.superAdminLogin, TEST_USER_CREDENTIALS);
    });
  });
});
