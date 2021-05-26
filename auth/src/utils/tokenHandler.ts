import { Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import {
  ACCESS_JWT_SECRET,
  ACCESS_JWT_TIME,
  JWT_DEFAULT_SECRET,
  NODE_ENV,
  REFRESH_JWT_SECRET,
  REFRESH_JWT_TIME_DEFAULT,
  REFRESH_JWT_TIME_STUDENT,
  REFRESH_JWT_TIME_SUPER_ADMIN,
} from '../config';
import { NodeEnvEnum } from '../constants/common';
import { UserRoleEnum } from '../database/entities/types';
import jwtTrackerUtils from '../modules/jwtTracker/utils';

export type UserTokenPayload = {
  userId: number;
  role: UserRoleEnum;
  [key: string]: unknown;
};

type TokenPayload = UserTokenPayload | string | { [key: string]: unknown };

const createToken = (
  tokenPayload: TokenPayload,
  secret: string,
  options: jwt.SignOptions,
): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!secret) return reject(new Error('JWT Secret is not set.'));

    return jwt.sign({ tokenPayload }, secret, options, (error, token) => {
      if (error) {
        return reject(error);
      }
      if (!token) {
        return reject(new Error('Token not generated'));
      }
      return resolve(token);
    });
  });

const getDecodedToken = <T>(
  token: string,
  secret: string = JWT_DEFAULT_SECRET,
): Promise<T> =>
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

const getTokenExpirationTime = (role?: UserRoleEnum) => {
  switch (role) {
    case UserRoleEnum.Student:
      return REFRESH_JWT_TIME_STUDENT;
    case UserRoleEnum.SuperAdmin:
      return REFRESH_JWT_TIME_SUPER_ADMIN;
    default:
      return REFRESH_JWT_TIME_DEFAULT;
  }
};

const getAccessToken = (userTokenPayload: UserTokenPayload): Promise<string> =>
  createToken(userTokenPayload, ACCESS_JWT_SECRET, {
    expiresIn: ACCESS_JWT_TIME,
  });

const getRefreshToken = (role?: UserRoleEnum): Promise<string> =>
  createToken(Date.now().toString(), REFRESH_JWT_SECRET, {
    expiresIn: getTokenExpirationTime(role),
  });

const getDecodedAccessToken = (
  token: string,
): Promise<{ tokenPayload: UserTokenPayload }> =>
  getDecodedToken(token, ACCESS_JWT_SECRET);

const getDecodedRefreshToken = (
  token: string,
): Promise<{ tokenPayload: TokenPayload }> =>
  getDecodedToken(token, REFRESH_JWT_SECRET);

// export class TokenAuthenticationError extends ApolloError {
//   constructor(message: string) {
//     super(message, 'TOKEN_AUTHENTICATION_ERROR');
//     Object.defineProperty(this, 'tokenAuthenticationError', {
//       value: 'tokenAuthenticationError',
//     });
//   }
// }

const setRefreshAndGetAccessToken = async (
  res: Response,
  userTokenPayload: UserTokenPayload,
): Promise<string> => {
  const { role, userId } = userTokenPayload;

  const refreshToken = await getRefreshToken(role);
  const accessToken = await getAccessToken(userTokenPayload);

  await jwtTrackerUtils.addJwtTracker(role, userId, refreshToken);

  res.cookie('refresh-token', refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === NodeEnvEnum.production,
  });

  return accessToken;
};

const tokenUtil = {
  getAccessToken,
  getRefreshToken,
  getDecodedAccessToken,
  getDecodedRefreshToken,
  setRefreshAndGetAccessToken,
  createToken,
  getDecodedToken,
};

export default tokenUtil;
