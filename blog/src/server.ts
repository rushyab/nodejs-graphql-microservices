import 'module-alias/register';
import { ApolloServer } from 'apollo-server-express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import app from './app';
import { NODE_ENV, BLOG_SERVICE_PORT } from './config';
import { NodeEnvEnum } from './constants/common';
import { context, schema } from './modules';
import { defaultDbConfig } from './ormconfig';
import LoggerService from './utils/logger';

const logger = new LoggerService('BlogService');

const server = new ApolloServer({
  schema,
  context,
  formatError: (error) => error,
  introspection: NODE_ENV === NodeEnvEnum.development,
  playground: NODE_ENV === NodeEnvEnum.development,
  subscriptions: false,
});

server.applyMiddleware({
  app,
  cors: false,
});

const startServer = async () => {
  try {
    await createConnection(defaultDbConfig);

    app.listen(BLOG_SERVICE_PORT, () => {
      logger.info(
        `
          🚀 📕 Blog Server started on http://localhost:${BLOG_SERVICE_PORT}${server.graphqlPath}`,
      );
    });
  } catch (error) {
    logger.error('Could not start the app', error);
  }
};

startServer().catch((err) => logger.error('Server error', err));
