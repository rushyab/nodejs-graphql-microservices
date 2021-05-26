import { normalizeTypeDefs } from '@apollo/federation';
import { printWithComments } from '@graphql-tools/merge';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { writeFileSync } from 'fs';
import { parse } from 'graphql';
import { request } from 'graphql-request';
import 'reflect-metadata';
import { FEDERATED_SCHEMA_FILE_PATH } from '../constants/apollo';
import { schema } from '../modules';
import LoggerService from '../utils/logger';

const app = express();

const TEMP_PORT = 7799;

const logger = new LoggerService('GenereateFederatedSchema');

const sdlQuery = `
  query {
    _service {
      sdl
    }
  }
`;

async function introspectAndWriteSchema(): Promise<void> {
  logger.info('-> Introspecting temp server');

  const sdlResult = await request(
    `http://localhost:${TEMP_PORT}/graphql`,
    sdlQuery,
  );

  // eslint-disable-next-line no-underscore-dangle
  const typeDefs = parse(sdlResult._service.sdl);

  const federatedSchema = `# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------

${printWithComments(normalizeTypeDefs(typeDefs))}`;

  writeFileSync(FEDERATED_SCHEMA_FILE_PATH, federatedSchema, {
    encoding: 'utf8',
  });

  logger.info('-> Federated schema generated!');
}

(function generateFederatedSchema(): void {
  // Create temp server
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const server = app.listen(TEMP_PORT, async () => {
    logger.info('-> Temp server created');

    await introspectAndWriteSchema().catch((err) =>
      logger.error(`Error occurred in introspection function ${err}`),
    );

    server.close((err) => {
      if (err) logger.error(`Error occurred while closing the server ${err}`);
      else logger.info('-> Temp server closed');
      process.exit();
    });
  });
})();
