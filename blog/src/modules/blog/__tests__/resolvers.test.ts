import { gql } from 'apollo-server-core';
import EasyGraphQLTester from 'easygraphql-tester';
import faker from 'faker';
import fc from 'fast-check';
import { Connection, createConnection } from 'typeorm';
import { useSeeding } from 'typeorm-seeding';
import { schema } from '../..';
import {
  BLOG_CONTENT_MAX_LEN,
  BLOG_CONTENT_MIN_LEN,
  BLOG_TITLE_MAX_LEN,
  BLOG_TITLE_MIN_LEN,
} from '../../../constants/validation';
import BlogEntity from '../../../database/entities/Blog';
import { UserRoleEnum } from '../../../database/entities/types';
import { testDbConfig } from '../../../ormconfig';
import {
  cExpect,
  cloneContextWithUnauthorizedRole,
  expectForbiddenError,
  FCInputGenerator,
  fcTestForGraphqlInvalidInputs,
} from '../../../tests/utils';

const CREATE_BLOG = gql`
  mutation($blogInfo: CreateBlogInput!) {
    createBlog(blogInfo: $blogInfo) {
      id
      createdTimeStamp
      createdBy {
        id
        role
      }
      title
      content
      author {
        ... on SuperAdminEntity {
          id
          role
        }
        ... on BlogAdminEntity {
          id
          role
        }
      }
    }
  }
`;

const context = {
  user: {
    userId: 1,
    role: UserRoleEnum.SuperAdmin,
  },
};

const BLOG_INFO = {
  title: faker.lorem.words(5),
  content: faker.lorem.paragraph(10),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tester: any;
let connection: Connection;

async function cleanUp() {
  if (connection?.isConnected) await connection.close();
}

describe('blog resolvers', () => {
  beforeAll(async () => {
    try {
      connection = await createConnection(testDbConfig);

      tester = new EasyGraphQLTester(schema);

      await useSeeding({
        connection: 'default',
      });
    } catch (error) {
      await cleanUp();
      throw error;
    }
  });

  afterAll(async () => {
    await cleanUp();
  });

  describe('createBlog', () => {
    it('should fail to validate input args', async () => {
      type CreateBlogInputArgs = 'title' | 'content';

      const validInputGenerators: FCInputGenerator<CreateBlogInputArgs>[] = [
        {
          property: 'title',
          generators: fc.string({
            minLength: BLOG_TITLE_MIN_LEN,
            maxLength: BLOG_TITLE_MAX_LEN,
          }),
        },
        {
          property: 'content',
          generators: fc.string({
            minLength: BLOG_CONTENT_MIN_LEN,
            maxLength: BLOG_CONTENT_MAX_LEN,
          }),
        },
      ];

      const invalidInputGenerators: FCInputGenerator<CreateBlogInputArgs>[] = [
        {
          property: 'title',
          generators: fc.oneof(
            fc.string({ minLength: BLOG_TITLE_MAX_LEN + 1 }),
            fc.string({ maxLength: BLOG_TITLE_MIN_LEN - 1 }),
            fc.falsy(),
          ),
        },
        {
          property: 'content',
          generators: fc.oneof(
            fc.string({ minLength: BLOG_CONTENT_MAX_LEN + 1 }),
            fc.string({ maxLength: BLOG_CONTENT_MIN_LEN - 1 }),
            fc.falsy(),
          ),
        },
      ];

      await fcTestForGraphqlInvalidInputs({
        tester,
        validInputGenerators,
        invalidInputGenerators,
        resolver: CREATE_BLOG,
        resolverArgumentName: 'blogInfo',
        context,
      });
    });

    it('should fail to create a blog when accessed by a unauthorized role and throw Unauthenticated Error', async () => {
      const authorizedRoles = [UserRoleEnum.SuperAdmin, UserRoleEnum.BlogAdmin];
      const unauthorizedContext = cloneContextWithUnauthorizedRole(
        context,
        authorizedRoles,
      );

      const { data, errors } = await tester.graphql(
        CREATE_BLOG,
        undefined,
        unauthorizedContext,
        {
          blogInfo: BLOG_INFO,
        },
      );

      cExpect(!data, JSON.stringify(data)).to.be.true;
      expectForbiddenError(errors);
    });

    it('should successfully create a blog', async () => {
      const { data, errors } = await tester.graphql(
        CREATE_BLOG,
        undefined,
        context,
        {
          blogInfo: BLOG_INFO,
        },
      );

      cExpect(!errors, JSON.stringify(errors)).to.be.true;
      cExpect(data?.createBlog).to.be.a('object');

      const blog = data.createBlog as BlogEntity;

      cExpect(Number(blog.id)).to.be.greaterThan(0);
      cExpect(blog).to.have.property('title').that.equals(BLOG_INFO.title);
      cExpect(blog).to.have.property('content').that.equals(BLOG_INFO.content);
      cExpect(blog)
        .to.have.nested.property('author.id')
        .that.equals(context.user.userId.toString());
      cExpect(blog)
        .to.have.nested.property('author.role')
        .that.equals(context.user.role);
    });
  });
});
