import { gql } from 'apollo-server-express';
import EasyGraphQLTester from 'easygraphql-tester';
import faker from 'faker';
import fc from 'fast-check';
import { Connection, createConnection } from 'typeorm';
import { factory, useSeeding } from 'typeorm-seeding';
import { schema } from '../..';
import { JWT_REG_EXP } from '../../../constants/regExp';
import {
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS,
} from '../../../constants/validation';
import BlogAdminEntity from '../../../database/entities/BlogAdmin';
import { UserRoleEnum } from '../../../database/entities/types';
import { testDbConfig } from '../../../ormconfig';
import {
  cExpect,
  expectErrorMsg,
  expectUnauthenticationError,
  FCInputGenerator,
  fcInvalidEmailInputGenerators,
  fcInvalidNameInputGenerators,
  fcInvalidPasswordInputGenerators,
  fcTestForGraphqlInvalidInputs,
  mockReq,
  mockRes,
} from '../../../tests/utils';
import { BLOG_ADMIN_RESOLVER_ERR_MSGS } from '../resolvers';
import { BlogAdminAuth } from '../types';

const context: { [key: string]: unknown } = {
  req: mockReq,
  res: mockRes,
};

const BLOG_ADMIN_DATA = `
  id
  email
  name
  createdTimeStamp
  role
`;

const BLOG_ADMIN_REGISTER = gql`
  mutation($registerInfo: BlogAdminRegisterInput!) {
    blogAdminRegister(registerInfo: $registerInfo) {
      token
      blogAdmin {
        ${BLOG_ADMIN_DATA}
      }
    }
  }
`;

const BLOG_ADMIN_LOGIN = gql`
  mutation($loginInfo: BlogAdminLoginInput!) {
    blogAdminLogin(loginInfo: $loginInfo) {
      token
      blogAdmin {
        ${BLOG_ADMIN_DATA}
      }
    }
  }
`;

const expectBlogAdminAuthData = (
  data: BlogAdminAuth,
  input: { [key: string]: unknown },
) => {
  cExpect(data).to.have.property('token').that.matches(JWT_REG_EXP);
  cExpect(data).to.have.property('blogAdmin').that.is.a('object');
  cExpect(Number(data.blogAdmin.id)).to.be.greaterThan(0);
  cExpect(data.blogAdmin.email).to.equal(input.email);
  cExpect(data.blogAdmin.name).to.equal(input.name);
  cExpect(data.blogAdmin.role).to.equal(UserRoleEnum.BlogAdmin);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tester: any;
let connection: Connection | undefined;

const testUserFName = faker.name.firstName();
const testUserLName = faker.name.lastName();
const TEST_USER_CREDENTIALS = {
  email: faker.unique(faker.internet.email, [testUserFName, testUserLName]),
  name: testUserFName + testUserLName,
  password: faker.internet.password(),
};

let blogAdminTestUser: BlogAdminEntity;

async function cleanUp() {
  if (connection?.isConnected) await connection.close();
}

describe('blogadmin auth resolvers', () => {
  beforeAll(async () => {
    try {
      connection = await createConnection(testDbConfig);

      tester = new EasyGraphQLTester(schema);

      await useSeeding({
        connection: 'default',
      });

      // Add test user to DB
      blogAdminTestUser = await factory(BlogAdminEntity)().create(
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

  describe('blogAdminRegister', () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.firstName();
    const BLOG_ADMIN_REGISTER_INPUT = {
      email: faker.unique(faker.internet.email, [firstName, lastName]),
      password: faker.internet.password(6),
      name: firstName + lastName,
    };

    type BlogAdminRegisterInputArgs = keyof typeof BLOG_ADMIN_REGISTER_INPUT;

    it('should fail to validate input args', async () => {
      const invalidInputGenerators: FCInputGenerator<BlogAdminRegisterInputArgs>[] = [
        {
          property: 'email',
          generators: fcInvalidEmailInputGenerators(),
        },
        {
          property: 'password',
          generators: fcInvalidPasswordInputGenerators(),
        },
        {
          property: 'name',
          generators: fcInvalidNameInputGenerators(),
        },
      ];

      const validInputGenerators: FCInputGenerator<BlogAdminRegisterInputArgs>[] = [
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
          property: 'name',
          generators: fc.constantFrom(
            faker.name.firstName(),
            faker.name.lastName(),
            faker.name.findName(),
          ),
        },
      ];

      fcTestForGraphqlInvalidInputs({
        tester,
        validInputGenerators,
        invalidInputGenerators,
        resolver: BLOG_ADMIN_REGISTER,
        resolverArgumentName: 'registerInfo',
        context,
        assertParams: {
          examples: [
            // Registering exisiting user
            [
              blogAdminTestUser.email,
              blogAdminTestUser.name,
              TEST_USER_CREDENTIALS.password,
            ],
          ],
        },
      });
    });

    it('should successfully register blogadmin and return auth data', async () => {
      const { data, errors } = await tester.graphql(
        BLOG_ADMIN_REGISTER,
        undefined,
        context,
        {
          registerInfo: BLOG_ADMIN_REGISTER_INPUT,
        },
      );

      cExpect(!errors, JSON.stringify(errors)).to.be.true;
      cExpect(data?.blogAdminRegister).to.be.a('object');
      expectBlogAdminAuthData(
        data.blogAdminRegister,
        BLOG_ADMIN_REGISTER_INPUT,
      );
    });
  });

  describe('blogAdminLogin', () => {
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
        resolver: BLOG_ADMIN_LOGIN,
        resolverArgumentName: 'loginInfo',
        context,
      });
    });

    it("should fail and throw not found error when user doesn't exist", async () => {
      const { data, errors } = await tester.graphql(
        BLOG_ADMIN_LOGIN,
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
        BLOG_ADMIN_RESOLVER_ERR_MSGS.accountNotFoundMatchingEmail,
        errors,
      );
    });

    it('should fail and throw inactive error when credentials are correct and account is inactive', async () => {
      // Create a inactive account
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const inactiveAccountInput = {
        password: faker.internet.password(),
        email: faker.unique(faker.internet.email, [firstName, lastName]),
        name: firstName + lastName,
        isActive: false,
      };

      await factory(BlogAdminEntity)().create(inactiveAccountInput);

      const { data, errors } = await tester.graphql(
        BLOG_ADMIN_LOGIN,
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
      expectErrorMsg(BLOG_ADMIN_RESOLVER_ERR_MSGS.accountNotActive, errors);
    });

    it('should fail and throw unauthenticated error when password is incorrect', async () => {
      const { data, errors } = await tester.graphql(
        BLOG_ADMIN_LOGIN,
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

    it('should succesfully validate credentials and return blogadmin auth data', async () => {
      const { data, errors } = await tester.graphql(
        BLOG_ADMIN_LOGIN,
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
      cExpect(data?.blogAdminLogin).to.be.a('object');
      expectBlogAdminAuthData(data.blogAdminLogin, TEST_USER_CREDENTIALS);
    });
  });
});
