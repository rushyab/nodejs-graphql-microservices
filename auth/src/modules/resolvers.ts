import { GraphQLResolverMap } from 'apollo-graphql';
import { ClassType, NonEmptyArray } from 'type-graphql';
import BlogAdminEntity from '../database/entities/BlogAdmin';
import SuperAdminEntity from '../database/entities/SuperAdmin';
import BlogAdminResolver from './blogAdmin';
import { MyContext } from './context';
import JwtTrackerResolvers from './jwtTracker';
import StudentResolver from './student';
import SuperAdminResolver from './superAdmin';
import { HealthResolver } from './utility';
import VerificationTrackerResolver from './verificationTracker';

const resolvers: NonEmptyArray<ClassType> = [
  HealthResolver,
  StudentResolver,
  JwtTrackerResolvers,
  SuperAdminResolver,
  BlogAdminResolver,
  VerificationTrackerResolver,
];

export const referenceResolvers: GraphQLResolverMap<MyContext> = {
  SuperAdminEntity: {
    __resolveReference: ({ id }: Pick<SuperAdminEntity, 'id'>, context) => {
      const { superAdminLoader } = context as MyContext;
      return superAdminLoader.load(id.toString());
    },
  },
  BlogAdminEntity: {
    __resolveReference: ({ id }: Pick<BlogAdminEntity, 'id'>, context) => {
      const { blogAdminLoader } = context as MyContext;
      return blogAdminLoader.load(id.toString());
    },
  },
};

export default resolvers;
