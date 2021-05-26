export const TOKEN_HEADER_NAME = 'authorization';
export const SALT_ROUNDS = 12;
export const RESET_PASSWORD_CODE_LENGTH = 6;
export const VERIFICATION_CODE_VALID_FOR_IN_MINUTES = 30;
export const OTP_LENGTH = 6;
export const SENDGRID_SENDER_ID = 'developer@digitedlabs.com';
export const GATEWAY_ORIGIN = 'apollo.gateway';

export enum NodeEnvEnum {
  development = 'development',
  staging = 'staging',
  testing = 'testing',
  production = 'production',
}
