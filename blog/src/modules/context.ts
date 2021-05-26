import { ExpressContext } from 'apollo-server-express';
import { Request, Response } from 'express';
import { UserTokenPayload } from '../utils/tokenHandler';
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
  if (connection) {
    return { ...connection.context };
  }

  const { user } = req.body.extensions || {};

  return { req, res, user };
};

export default context;
