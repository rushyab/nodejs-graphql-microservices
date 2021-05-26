import { buildFederatedSchemaSync } from '../helpers/buildFederatedSchema';
import context from './context';
import resolvers from './resolvers';

const schema = buildFederatedSchemaSync(
  {
    resolvers,
    orphanedTypes: [],
  },
);

export { schema, context };
