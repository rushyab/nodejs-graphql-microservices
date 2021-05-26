import { AuthenticationError } from 'apollo-server-express';
import { ADMIN_CREATION_KEY } from '../../config';
import {
  ERR_MSG_ACCOUNT_NOT_ACTIVE,
  ERR_MSG_ACCOUNT_NOT_FOUND_MATCHING_EMAIL,
} from '../../constants/errorMessages';
import SuperAdminEntity from '../../database/entities/SuperAdmin';
import { UserRoleEnum } from '../../database/entities/types';
import checkUnsuccessfulLoginAttempts from '../../utils/checkUnsuccessfulLoginAttempts';
import { comparePasswordToHash } from '../../utils/comparePasswordToHash';
import tokenUtil from '../../utils/tokenHandler';
import { MyContext } from '../context';
import {
  SuperAdminAuth,
  SuperAdminLoginInput,
  SuperAdminRegisterInput,
} from './types';

export const SUPER_ADMIN_RESOLVER_ERR_MSGS = {
  accountNotFoundMatchingEmail: ERR_MSG_ACCOUNT_NOT_FOUND_MATCHING_EMAIL,
  accountNotActive: ERR_MSG_ACCOUNT_NOT_ACTIVE,
} as const;

async function superAdminRegister(
  { email, password, key }: SuperAdminRegisterInput,
  ctx: MyContext,
): Promise<SuperAdminAuth> {
  if (key !== ADMIN_CREATION_KEY) {
    throw new AuthenticationError('Invalid Key!');
  }

  const superAdmin = await SuperAdminEntity.create({
    email,
    password,
  }).save();

  const token = await tokenUtil.setRefreshAndGetAccessToken(ctx.res, {
    userId: superAdmin.id,
    role: UserRoleEnum.SuperAdmin,
  });

  return { token, superAdmin };
}

async function superAdminLogin(
  { email, password }: SuperAdminLoginInput,
  ctx: MyContext,
): Promise<SuperAdminAuth> {
  const superAdmin = await SuperAdminEntity.findOne({ email });

  if (!superAdmin) {
    throw new Error(SUPER_ADMIN_RESOLVER_ERR_MSGS.accountNotFoundMatchingEmail);
  }

  await checkUnsuccessfulLoginAttempts(superAdmin, () =>
    comparePasswordToHash(password, superAdmin.password),
  );

  if (!superAdmin.isActive) {
    throw new Error(SUPER_ADMIN_RESOLVER_ERR_MSGS.accountNotActive);
  }

  const token = await tokenUtil.setRefreshAndGetAccessToken(ctx.res, {
    userId: superAdmin.id,
    role: UserRoleEnum.SuperAdmin,
  });

  return { token, superAdmin };
}

export default {
  superAdminRegister,
  superAdminLogin,
};
