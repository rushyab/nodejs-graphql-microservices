import { NodeEnvEnum } from "../constants/common";

export const {
  BLOG_SERVICE_PORT = '',
  BLOG_SERVICE_NAME = '',
  WORKERS = '',
  NODE_ENV = '',
  POSTGRESQL_DB_HOST = '',
  POSTGRESQL_USERNAME = '',
  POSTGRESQL_PASSWORD = '',
  POSTGRESQL_DB_NAME = '',
  POSTGRESQL_DB_PORT = '',
  SENDGRID_API_KEY = '',
  APOLLO_KEY = '',
} = process.env;

const config = {
  BLOG_SERVICE_PORT,
  BLOG_SERVICE_NAME,
  WORKERS,
  NODE_ENV,
  POSTGRESQL_DB_HOST,
  POSTGRESQL_USERNAME,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_DB_NAME,
  POSTGRESQL_DB_PORT,
  SENDGRID_API_KEY,
  APOLLO_KEY
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
