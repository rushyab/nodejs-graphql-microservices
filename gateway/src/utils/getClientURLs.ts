import { GATEWAY_SERVICE_PORT, NODE_ENV } from '../config';
import { NodeEnvEnum } from '../constants/common';

export default function getClientURLs(): string[] {
  let urls: string[];

  switch (NODE_ENV) {
    case NodeEnvEnum.staging:
      urls = [''];
      break;
    case NodeEnvEnum.testing:
      urls = [''];
      break;
    case NodeEnvEnum.production:
      urls = [''];
      break;
    default:
      // development
      urls = [
        'http://localhost:3000',
        `http://localhost:${GATEWAY_SERVICE_PORT}`,
        'https://studio.apollographql.com',
      ];
  }

  return urls;
}
