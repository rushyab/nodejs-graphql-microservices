import { UserRoleEnum } from '../database/entities/types';

export type UserTokenPayload = {
  userId: number;
  role: UserRoleEnum;
  [key: string]: unknown;
};
