import { NodeEnvEnum } from '../constants/common';

export const {
  AUTH_SERVICE_PORT = '',
  AUTH_SERVICE_NAME = '',
  WORKERS = '',
  ACCESS_JWT_SECRET = '',
  ACCESS_JWT_TIME = '',
  REFRESH_JWT_SECRET = '',
  REFRESH_JWT_TIME_STUDENT = '',
  REFRESH_JWT_TIME_SUPER_ADMIN = '',
  REFRESH_JWT_TIME_DEFAULT = '',
  NODE_ENV = '',
  ADMIN_CREATION_KEY = '',
  JWT_DEFAULT_SECRET = '',
  POSTGRESQL_DB_HOST = '',
  POSTGRESQL_USERNAME = '',
  POSTGRESQL_PASSWORD = '',
  POSTGRESQL_DB_NAME = '',
  POSTGRESQL_DB_PORT = '',
  SENDGRID_API_KEY = '',
  APOLLO_KEY = '',
} = process.env;

const config = {
  AUTH_SERVICE_PORT,
  AUTH_SERVICE_NAME,
  WORKERS,
  ACCESS_JWT_SECRET,
  ACCESS_JWT_TIME,
  REFRESH_JWT_SECRET,
  REFRESH_JWT_TIME_STUDENT,
  REFRESH_JWT_TIME_SUPER_ADMIN,
  REFRESH_JWT_TIME_DEFAULT,
  NODE_ENV,
  ADMIN_CREATION_KEY,
  JWT_DEFAULT_SECRET,
  POSTGRESQL_DB_HOST,
  POSTGRESQL_USERNAME,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_DB_NAME,
  POSTGRESQL_DB_PORT,
  SENDGRID_API_KEY,
  APOLLO_KEY,
};

function checkEnvVariablesExists() {
  const keys = Object.keys(config);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      throw new Error(
        `Environment variables are not defined properly. 
         Please cross check src/config with .env.*."  ${key}: ${process.env[key]}`,
      );
    }
  }

  if (!(NODE_ENV in NodeEnvEnum)) {
    throw new Error(
      `Invalid 'NODE_ENV' value: ${NODE_ENV}. Only ${JSON.stringify(
        Object.values(NodeEnvEnum),
      )} are allowed.`,
    );
  }

  return config;
}

export default checkEnvVariablesExists();
