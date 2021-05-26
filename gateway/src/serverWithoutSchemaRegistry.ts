import { ApolloGateway, LocalGraphQLDataSource } from '@apollo/gateway';
import { ApolloServer } from 'apollo-server-express';
import {
  GraphQLExecutionResult,
  GraphQLRequestContextExecutionDidStart,
} from 'apollo-server-types';
import { GraphQLSchema } from 'graphql';
import app from './app';
import {
  AUTH_SERVICE_NAME,
  AUTH_SERVICE_PORT,
  BLOG_SERVICE_NAME,
  BLOG_SERVICE_PORT,
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

const LOAD_GATEWAY_RETRIES = 3;
const LOAD_GATEWAY_RETRY_AFTER = 2000; // ms

const localServices: LocalServices = {
  [GATEWAY_SERVICE_NAME]: {
    schema,
  },
};

const remoteServices: RemoteServices = {
  [AUTH_SERVICE_NAME]: {
    url: `http://${AUTH_SERVICE_NAME}:${AUTH_SERVICE_PORT}}/graphql`,
  },
  [BLOG_SERVICE_NAME]: {
    url: `http://${BLOG_SERVICE_NAME}:${BLOG_SERVICE_PORT}/graphql`,
  },
};

const services = {
  ...localServices,
  ...remoteServices,
};

function getGateway(): ApolloGateway {
  return new ApolloGateway({
    // We can't use localServiceList and serviceList at the same time,
    // so we pretend the local services are remote, but point the ApolloGateway
    // at LocalGraphQLDataSources instead...
    serviceList: Object.keys(services).map((name) => ({
      name,
      url:
        ((services as unknown) as RemoteServices)[name].url ||
        DUMMY_SERVICE_URL,
    })),

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
    experimental_pollInterval: 5000,

    // Experimental: Enabling this enables the query plan view in Playground.
    __exposeQueryPlanExperimental: NODE_ENV === NodeEnvEnum.development,
  });
}

async function loadGateway(
  tries: number,
): Promise<{
  schema: GraphQLSchema;
  executor: <TContext>(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ) => Promise<GraphQLExecutionResult>;
}> {
  try {
    const res = await getGateway().load();
    return res;
  } catch (err) {
    if (tries > 0) {
      await sleep(LOAD_GATEWAY_RETRY_AFTER);
      logger.warn(
        `⏳ Gateway not ready. Retry attempt: ${
          LOAD_GATEWAY_RETRIES - tries + 1
        }`,
      );
      return loadGateway(tries - 1);
    }
    throw err;
  }
}

async function createServer(): Promise<ApolloServer> {
  const { schema: stichedSchema, executor } = await loadGateway(
    LOAD_GATEWAY_RETRIES,
  );

  const server = new ApolloServer({
    schema: stichedSchema,
    executor,
    context,
    formatError: (error) => error,
    introspection: NODE_ENV === NodeEnvEnum.development,
    playground: NODE_ENV === NodeEnvEnum.development,
    subscriptions: false,
  });

  return server;
}

(function startServer() {
  createServer()
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
