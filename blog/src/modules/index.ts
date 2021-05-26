import { buildFederatedSchemaSync } from '../helpers/buildFederatedSchema';
import authChecker from '../utils/authChecker';
import context from './context';
import resolvers, { referenceResolvers } from './resolvers';

const schema = buildFederatedSchemaSync(
  {
    resolvers,
    authChecker,
    orphanedTypes: [],
  },
  referenceResolvers,
);

export { schema, context };
