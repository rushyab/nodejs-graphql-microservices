import BlogAdminEntity from '../database/entities/BlogAdmin';
import StudentEntity from '../database/entities/Student';
import SuperAdminEntity from '../database/entities/SuperAdmin';
import { UserRoleEnum } from '../database/entities/types';
import { isEmail, isMobileNumber } from './fieldValidators';

type User = SuperAdminEntity | BlogAdminEntity | StudentEntity;

const rolesWithoutMobileField = [
  UserRoleEnum.SuperAdmin,
  UserRoleEnum.BlogAdmin,
];

const rolesWithoutEmailField = [UserRoleEnum.Student];

export const findUserByUniqueFieldAndRoleOrFail = async (
  fieldName: 'email' | 'mobile',
  fieldValue: string,
  role: UserRoleEnum,
): Promise<User> => {
  let user: User | null | undefined;

  if (
    (fieldName === 'mobile' && rolesWithoutMobileField.includes(role)) ||
    (fieldName === 'email' && rolesWithoutEmailField.includes(role))
  ) {
    throw new Error(`Field ${fieldName} doesn't exist on ${role}`);
  }

  if (fieldName === 'email' && !isEmail(fieldValue)) {
    throw new Error('Invalid email');
  }

  if (fieldName === 'mobile' && !isMobileNumber(fieldValue)) {
    throw new Error('Invalid mobile');
  }

  switch (role) {
    case UserRoleEnum.SuperAdmin:
      user = await SuperAdminEntity.findOne({ [fieldName]: fieldValue });
      break;

    case UserRoleEnum.BlogAdmin:
      user = await BlogAdminEntity.findOne({ [fieldName]: fieldValue });
      break;

    case UserRoleEnum.Student:
      user = await StudentEntity.findOne({ [fieldName]: fieldValue });
      break;

    default:
      user = null;
  }

  if (!user) {
    throw new Error(`No ${role} found with ${fieldName}: ${fieldValue}`);
  }

  return user;
};
