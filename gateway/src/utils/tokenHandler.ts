import { ApolloError } from 'apollo-server-express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '../config';
import UserRoleEnum from '../constants/roles';

export type UserTokenPayload = {
  userId: number;
  role: UserRoleEnum;
  [key: string]: unknown;
};

const getDecodedToken = <T>(token: string, secret: string): Promise<T> =>
  new Promise((resolve, reject) => {
    if (!secret) return reject(new Error('JWT Secret is not set.'));
    return jwt.verify(
      token,
      secret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: VerifyErrors | null, decodedToken: any) => {
        if (error) {
          return reject(error);
        }

        if (!decodedToken || !decodedToken.iat) {
          return reject(new Error(`Token had no 'iat' in payload`));
        }
        return resolve(decodedToken);
      },
    );
  });

const getDecodedAccessToken = (
  token: string,
): Promise<{ tokenPayload: UserTokenPayload }> =>
  getDecodedToken(token, ACCESS_JWT_SECRET);

export class TokenAuthenticationError extends ApolloError {
  constructor(message: string) {
    super(message, 'TOKEN_AUTHENTICATION_ERROR');
    Object.defineProperty(this, 'tokenAuthenticationError', {
      value: 'tokenAuthenticationError',
    });
  }
}

const tokenUtil = {
  getDecodedAccessToken,
};

export default tokenUtil;
