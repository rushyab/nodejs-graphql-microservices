import { exec } from 'child_process';
import {
  AUTH_SERVICE_NAME,
  AUTH_SERVICE_PORT,
  BLOG_SERVICE_NAME,
  BLOG_SERVICE_PORT,
  NODE_ENV,
} from '../config';
import { NodeEnvEnum } from '../constants/common';
import LoggerService from '../utils/logger';

const logger = new LoggerService('PushSchema');

function getPushCommand(
  endpoint: string,
  serviceURL: string,
  serviceName: string,
  variant: string,
): string {
  return `npx apollo service:push --variant=${variant} --serviceName=${serviceName} --serviceURL=${serviceURL}/graphql --endpoint=${endpoint}/graphql`;
}

function checkIfArgumentsAreUndefined(obj: { [key: string]: any }) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      throw new Error(
        `Argument '${key}' is not defined. 
Please pass it as
${key}=SAMPLE npm run ...
(or)
npm --${key}=SAMPLE run ...`,
      );
    }
  }
}

(function push() {
  try {
    let pushCommand: string | undefined;

    const config = {
      serviceName: process.env.serviceName || '',
      variant: process.env.variant || '',
      endpoint: process.env.endpoint || '',
      serviceURL: process.env.serviceURL || '',
    };

    const { endpoint, serviceURL, ...mandatory } = config;

    checkIfArgumentsAreUndefined(mandatory);

    const { variant, serviceName } = mandatory;

    // If not in development, variant should match NODE_ENV
    if (NODE_ENV !== NodeEnvEnum.development) {
      if (variant !== NODE_ENV) {
        throw new Error(
          `variant (${variant}) doesn't match NODE_ENV (${NODE_ENV})`,
        );
      }
    }

    switch (serviceName) {
      case AUTH_SERVICE_NAME: {
        const authDockerHost = `http://${AUTH_SERVICE_NAME}:${AUTH_SERVICE_PORT}`;

        pushCommand = getPushCommand(
          endpoint || authDockerHost,
          serviceURL || authDockerHost,
          serviceName,
          variant,
        );
        break;
      }

      case BLOG_SERVICE_NAME: {
        const blogDockerHost = `http://${BLOG_SERVICE_NAME}:${BLOG_SERVICE_PORT}`;

        pushCommand = getPushCommand(
          endpoint || blogDockerHost,
          serviceURL || blogDockerHost,
          serviceName,
          variant,
        );
        break;
      }

      default:
        throw new Error(
          `Invalid 'serviceName' value: '${serviceName}'. Only ${AUTH_SERVICE_NAME}, ${BLOG_SERVICE_NAME} are allowed`,
        );
    }

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
