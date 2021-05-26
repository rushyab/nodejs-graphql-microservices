import { ExpressContext } from 'apollo-server-express';
import { Request, Response } from 'express';
import { superAdminLoader, blogAdminLoader } from '../loaders';
import { UserTokenPayload } from '../utils/tokenHandler';

export interface MyContext {
  req: Request;
  res: Response;
  user?: UserTokenPayload;
  superAdminLoader: ReturnType<typeof superAdminLoader>;
  blogAdminLoader: ReturnType<typeof blogAdminLoader>;
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

  return {
    req,
    res,
    user,
    // New loader created for every req
    superAdminLoader: superAdminLoader(),
    blogAdminLoader: blogAdminLoader(),
  };
};

export default context;
