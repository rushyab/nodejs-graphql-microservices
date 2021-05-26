import { DeleteResult, getConnection, InsertResult } from 'typeorm';
import {
  REFRESH_JWT_TIME_DEFAULT,
  REFRESH_JWT_TIME_STUDENT,
  REFRESH_JWT_TIME_SUPER_ADMIN,
} from '../../config';
import { JwtTrackerEntity } from '../../database/entities/JwtTracker';
import { UserRoleEnum } from '../../database/entities/types';

async function getJwtFromDb(
  token: string,
): Promise<JwtTrackerEntity | undefined> {
  return getConnection().getRepository(JwtTrackerEntity).findOne({
    where: {
      token,
    },
  });
}

async function checkJwtExistsInDb(token: string): Promise<boolean> {
  const jwtExists = await getConnection()
    .createQueryBuilder()
    .select('JwtTrackerEntity')
    .from(JwtTrackerEntity, 'JwtTrackerEntity')
    .where('JwtTrackerEntity.token = :token', { token })
    .orderBy('JwtTrackerEntity.createdTimeStamp', 'DESC')
    .getOne();

  if (jwtExists) {
    return true;
  }
  return false;
}

async function destroyJwt(
  userId: number,
  token: string,
): Promise<DeleteResult> {
  return getConnection()
    .createQueryBuilder()
    .delete()
    .from(JwtTrackerEntity)
    .where({
      userId,
      jwtToken: token,
    })
    .execute();
}

const getJwtExpiryDateFromRole = (role: UserRoleEnum): Date => {
  const date = new Date();
  switch (role) {
    case UserRoleEnum.Student:
      date.setDate(date.getDate() + parseInt(REFRESH_JWT_TIME_STUDENT, 10));
      return date;
    case UserRoleEnum.SuperAdmin:
      date.setDate(date.getDate() + parseInt(REFRESH_JWT_TIME_SUPER_ADMIN, 10));
      return date;
    default:
      date.setDate(date.getDate() + parseInt(REFRESH_JWT_TIME_DEFAULT, 10));
      return date;
  }
};

async function addJwtTracker(
  role: UserRoleEnum,
  userId: number,
  token: string,
): Promise<InsertResult> {
  return getConnection()
    .createQueryBuilder()
    .insert()
    .into(JwtTrackerEntity)
    .values({
      createdTimeStamp: new Date(),
      userId,
      userRole: role,
      expiryTime: getJwtExpiryDateFromRole(role),
      token,
    })
    .execute();
}

export default {
  getJwtFromDb,
  checkJwtExistsInDb,
  addJwtTracker,
  destroyJwt,
};
