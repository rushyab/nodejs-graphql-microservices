import { exec } from 'child_process';
import { AUTH_SERVICE_NAME, AUTH_SERVICE_PORT, NODE_ENV } from '../config';
import { FEDERATED_SCHEMA_FILE_PATH } from '../constants/apollo';
import { NodeEnvEnum } from '../constants/common';
import LoggerService from '../utils/logger';

const logger = new LoggerService('PushLocalSchema');

function getPushCommand(variant: string): string {
  return `npx apollo service:push --variant=${variant} --serviceName=${AUTH_SERVICE_NAME} --serviceURL=http://${AUTH_SERVICE_NAME}:${AUTH_SERVICE_PORT}/graphql --localSchemaFile=${FEDERATED_SCHEMA_FILE_PATH}`;
}

(function push() {
  try {
    const { variant } = process.env;

    if (!variant) {
      throw new Error("Please pass env variable 'variant'");
    }

    // If not in development, variant should match NODE_ENV
    if (NODE_ENV !== NodeEnvEnum.development) {
      if (variant !== NODE_ENV) {
        throw new Error(
          `variant (${variant}) doesn't match NODE_ENV (${NODE_ENV})`,
        );
      }
    }
    const pushCommand: string = getPushCommand(variant);

    exec(pushCommand, (err, stdout, stderr) => {
      logger.debug(`\n> ${pushCommand}\n`);
      if (err) {
        logger.error(`${err}`);
      } else {
        // the *entire* stdout and stderr (buffered)
        if (stdout) logger.info(`stdout: ${stdout}`);
        if (stderr) logger.error(`stderr: ${stderr}`);
      }
    });
  } catch (error) {
    logger.error(`${error}`);
  }
})();
