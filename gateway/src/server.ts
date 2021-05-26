import { ApolloGateway, LocalGraphQLDataSource } from '@apollo/gateway';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import app from './app';
import {
  APOLLO_KEY,
  GATEWAY_SERVICE_NAME,
  GATEWAY_SERVICE_PORT,
  NODE_ENV,
} from './config';
import { DUMMY_SERVICE_URL } from './constants/apollo';
import { NodeEnvEnum } from './constants/common';
import AuthenticatedDataSource from './helpers/AuthenticatedDataSource';
import { context, schema } from './modules';
import LoggerService from './utils/logger';
import sleep from './utils/sleep';

type LocalServices = {
  [key: string]: {
    schema: GraphQLSchema;
  };
};

type RemoteServices = {
  [key: string]: {
    url: string;
  };
};

const logger = new LoggerService('GatewayServer');

const LOAD_GATEWAY_RETRIES = 2;
const LOAD_GATEWAY_RETRY_AFTER = 2000; // ms

const localServices: LocalServices = {
  [GATEWAY_SERVICE_NAME]: {
    schema,
  },
};

const remoteServices: RemoteServices = {};

const services = {
  ...localServices,
  ...remoteServices,
};

function getGateway(): ApolloGateway {
  return new ApolloGateway({
    buildService({ name, url }) {
      if (url === DUMMY_SERVICE_URL) {
        return new LocalGraphQLDataSource(
          ((services as unknown) as LocalServices)[name].schema,
        );
      }

      return new AuthenticatedDataSource({
        url,
      });
    },
    // debug: NODE_ENV === NodeEnvEnum.development,
    __exposeQueryPlanExperimental: NODE_ENV === NodeEnvEnum.development,
  });
}

async function createServer(tries: number): Promise<ApolloServer> {
  try {
    const gateway = getGateway();

    // Used only for development purpose
    const GRAPH_VARIANT = '';

    const graphVariant =
      NODE_ENV === NodeEnvEnum.development && !!GRAPH_VARIANT
        ? GRAPH_VARIANT
        : NODE_ENV;

    const server = new ApolloServer({
      gateway,
      context,
      engine: {
        apiKey: APOLLO_KEY,
        graphVariant,
      },
      formatError: (error) => error,
      introspection: NODE_ENV === NodeEnvEnum.development,
      playground: NODE_ENV === NodeEnvEnum.development,
      subscriptions: false,
    });

    // Awaiting a call to `start` ensures that a schema has been loaded and that
    // all plugin `serverWillStart` hooks have been called. If either of these
    // processes throw, `start` will (async) throw as well.
    await server.start();

    return server;
  } catch (error) {
    if (tries > 0) {
      await sleep(LOAD_GATEWAY_RETRY_AFTER);
      logger.warn(
        `⏳ Gateway not ready. Retry attempt: ${
          LOAD_GATEWAY_RETRIES - tries + 1
        }`,
      );

      return createServer(tries - 1);
    }

    throw error;
  }
}

(function startServer() {
  createServer(LOAD_GATEWAY_RETRIES)
    .then((server: ApolloServer) => {
      server.applyMiddleware({
        app,
        cors: false, // disables the apollo-server-express cors to allow the cors middleware use
      });

      app.listen(GATEWAY_SERVICE_PORT, () => {
        logger.info(
          `
          🚀 🚪 Gateway server started on http://localhost:${GATEWAY_SERVICE_PORT}${server.graphqlPath}`,
        );
      });
    })
    .catch((err) => {
      logger.error(err);
      // process.exitCode = -1;
    });
})();
