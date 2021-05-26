// By providing a protocol we trick ApolloGateway into thinking that this is a valid URL;
// otherwise it assumes it's a relative URL, and complains.
export const DUMMY_SERVICE_URL = 'http://';

export const FEDERATED_SCHEMA_FILE_PATH = './src/helpers/federated-schema.gql';
