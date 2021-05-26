import {
  ERR_MSG_ACCOUNT_NOT_ACTIVE,
  ERR_MSG_ACCOUNT_NOT_FOUND_MATCHING_EMAIL,
} from '../../constants/errorMessages';
import BlogAdminEntity from '../../database/entities/BlogAdmin';
import { UserRoleEnum } from '../../database/entities/types';
import checkUnsuccessfulLoginAttempts from '../../utils/checkUnsuccessfulLoginAttempts';
import { comparePasswordToHash } from '../../utils/comparePasswordToHash';
import tokenUtil from '../../utils/tokenHandler';
import { MyContext } from '../context';
import {
  BlogAdminAuth,
  BlogAdminLoginInput,
  BlogAdminRegisterInput,
} from './types';

export const BLOG_ADMIN_RESOLVER_ERR_MSGS = {
  accountNotFoundMatchingEmail: ERR_MSG_ACCOUNT_NOT_FOUND_MATCHING_EMAIL,
  accountNotActive: ERR_MSG_ACCOUNT_NOT_ACTIVE,
} as const;

async function blogAdminRegister(
  { email, password, name }: BlogAdminRegisterInput,
  ctx: MyContext,
): Promise<BlogAdminAuth> {
  const blogAdmin = await BlogAdminEntity.create({
    email,
    password,
    name,
    createdBy: {
      role: ctx.user?.role || UserRoleEnum.BlogAdmin,
    },
  }).save();

  const token = await tokenUtil.setRefreshAndGetAccessToken(ctx.res, {
    userId: blogAdmin.id,
    role: UserRoleEnum.BlogAdmin,
  });

  return { token, blogAdmin };
}

async function blogAdminLogin(
  { email, password }: BlogAdminLoginInput,
  ctx: MyContext,
): Promise<BlogAdminAuth> {
  const blogAdmin = await BlogAdminEntity.findOne({ email });

  if (!blogAdmin) {
    throw new Error(BLOG_ADMIN_RESOLVER_ERR_MSGS.accountNotFoundMatchingEmail);
  }

  await checkUnsuccessfulLoginAttempts(blogAdmin, () =>
    comparePasswordToHash(password, blogAdmin.password),
  );

  if (!blogAdmin.isActive) {
    throw new Error(BLOG_ADMIN_RESOLVER_ERR_MSGS.accountNotActive);
  }

  const token = await tokenUtil.setRefreshAndGetAccessToken(ctx.res, {
    userId: blogAdmin.id,
    role: UserRoleEnum.BlogAdmin,
  });

  return { token, blogAdmin };
}

export default {
  blogAdminRegister,
  blogAdminLogin,
};
