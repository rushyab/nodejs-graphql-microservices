import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import {
  NODE_ENV,
  POSTGRESQL_DB_HOST,
  POSTGRESQL_DB_NAME,
  POSTGRESQL_DB_PORT,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_USERNAME,
} from './config';
import { NodeEnvEnum } from './constants/common';

const rootDir = NODE_ENV === NodeEnvEnum.production ? 'dist' : 'src';

const baseOptions: PostgresConnectionOptions = {
  type: 'postgres',
  port: parseInt(POSTGRESQL_DB_PORT, 10),
  host: POSTGRESQL_DB_HOST,
  username: POSTGRESQL_USERNAME,
  password: POSTGRESQL_PASSWORD,
  synchronize: true,
  logging: NODE_ENV === NodeEnvEnum.development,
  entities: [`${rootDir}/database/entities/*.*`],
};

const defaultDbConfig: PostgresConnectionOptions = {
  database: POSTGRESQL_DB_NAME,

  ...baseOptions,
};

const testDbConfig: PostgresConnectionOptions = {
  database: `${POSTGRESQL_DB_NAME}_test`,

  // dropSchema: true,

  ...baseOptions,
};

export { defaultDbConfig, testDbConfig };
