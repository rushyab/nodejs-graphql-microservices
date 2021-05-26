import { GraphQLResolverMap } from 'apollo-graphql';
import { ClassType, NonEmptyArray } from 'type-graphql';
import BlogResolver from './blog';
import CommentResolver from './comment';
import { MyContext } from './context';
import { HealthResolver } from './utility';

const resolvers: NonEmptyArray<ClassType> = [
  HealthResolver,
  BlogResolver,
  CommentResolver,
];

export const referenceResolvers: GraphQLResolverMap<MyContext> = {
}

export default resolvers;
