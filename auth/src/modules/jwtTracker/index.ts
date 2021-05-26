import { AuthenticationError } from 'apollo-server-express';
import { Request } from 'express';
import { Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { NODE_ENV } from '../../config';
import { NodeEnvEnum } from '../../constants/common';
import { UserRoleEnum } from '../../database/entities/types';
import tokenHandler, { UserTokenPayload } from '../../utils/tokenHandler';
import { MyContext } from '../context';
import jwtUtils from './utils';

const checkRefreshAndGetNewAccessToken = async (
  req: Request,
  validateRefresh = false,
): Promise<string> => {
  if (!req) {
    throw new Error('Invalid request');
  }

  const { cookies } = req;

  const refreshToken = cookies['refresh-token'];
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token not present');
  }

  const refreshTokenInDb = await jwtUtils.getJwtFromDb(refreshToken);
  if (!refreshTokenInDb) {
    throw new AuthenticationError('Invalid refresh token');
  }

  if (validateRefresh) {
    try {
      await tokenHandler.getDecodedRefreshToken(refreshToken);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  const tokenPayload: UserTokenPayload = {
    userId: refreshTokenInDb.userId,
    role: refreshTokenInDb.userRole,
  };

  return tokenHandler.getAccessToken(tokenPayload);
};

@Resolver()
export default class JwtTrackerResolvers {
  @Query(() => String)
  async checkRefreshAndGetAccessToken(@Ctx() ctx: MyContext): Promise<string> {
    return checkRefreshAndGetNewAccessToken(ctx.req);
  }

  @Query(() => String)
  async validateRefreshAndGetAccessToken(
    @Ctx() ctx: MyContext,
  ): Promise<string> {
    return checkRefreshAndGetNewAccessToken(ctx.req, true);
  }

  @Authorized([
    UserRoleEnum.SuperAdmin,
    UserRoleEnum.BlogAdmin,
    UserRoleEnum.Student,
  ])
  @Mutation(() => Boolean)
  logout(@Ctx() ctx: MyContext): true {
    const { req, user, res } = ctx;

    if (!user) {
      throw new AuthenticationError('Not Authorized');
    }

    const { userId } = user;

    const refreshToken = req.cookies['refresh-token'];

    jwtUtils.destroyJwt(userId, refreshToken);

    res.cookie('refresh-token', '---deleted---', {
      httpOnly: true,
      secure: NODE_ENV === NodeEnvEnum.production,
      maxAge: -1,
    });

    return true;
  }
}
