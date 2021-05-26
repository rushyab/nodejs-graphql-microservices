import {
  buildFederatedSchema as buildApolloFederationSchema,
  printSchema,
} from '@apollo/federation';
import federationDirectives from '@apollo/federation/dist/directives';
import { addResolversToSchema, GraphQLResolverMap } from 'apollo-graphql';
import { GraphQLSchema, specifiedDirectives } from 'graphql';
import gql from 'graphql-tag';
import {
  BuildSchemaOptions,
  buildSchemaSync,
  createResolversMap,
} from 'type-graphql';

export function buildFederatedSchemaSync(
  options: Omit<BuildSchemaOptions, 'skipCheck'>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  referenceResolvers?: GraphQLResolverMap<any>,
): GraphQLSchema {
  const schema = buildSchemaSync({
    ...options,
    // emitSchemaFile: {
    //   path: `${__dirname}/../modules/schema.gql`,
    //   commentDescriptions: true,
    //   sortedSchema: false, // by default the printed schema is sorted alphabetically
    // },
    directives: [
      ...specifiedDirectives,
      ...federationDirectives,
      ...(options.directives || []),
    ],
    skipCheck: true,
  });

  const federatedSchema = buildApolloFederationSchema({
    typeDefs: gql(printSchema(schema)),
    resolvers: createResolversMap(schema) as any,
  });

  if (referenceResolvers) {
    addResolversToSchema(federatedSchema, referenceResolvers);
  }
  return federatedSchema;
}
