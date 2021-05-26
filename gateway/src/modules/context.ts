import { ExpressContext } from 'apollo-server-express';
import { Request, Response } from 'express';
import { TOKEN_HEADER_NAME } from '../constants/common';
import tokenHandler, {
  TokenAuthenticationError,
  UserTokenPayload,
} from '../utils/tokenHandler';

export interface MyContext {
  req: Request;
  res: Response;
  user?: UserTokenPayload;
}

const context = async ({
  req,
  res,
  connection,
}: ExpressContext): Promise<MyContext | void> => {
  try {
    if (connection) {
      return { ...connection.context };
    }

    const token = req.get(TOKEN_HEADER_NAME);
    let userTokenPayload: UserTokenPayload | undefined;
    if (token && req.headers.authorization?.indexOf('Basic ') === -1) {
      userTokenPayload = (await tokenHandler.getDecodedAccessToken(token))
        .tokenPayload;
    }

    return {
      user: userTokenPayload,
      req,
      res,
    };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new TokenAuthenticationError('Invalid Token');
    }
    throw err;
  }
};

export default context;
