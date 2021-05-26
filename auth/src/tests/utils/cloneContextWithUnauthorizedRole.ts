import faker from 'faker';
import { UserRoleEnum } from '../../database/entities/types';
import { MyContext } from '../../modules/context';
import { RequireField } from '../../utils/customTypes';
import deepCopy from '../../utils/deepCopy';

function getUnauthorizedRoles(authorizedRoles: UserRoleEnum[]): UserRoleEnum[] {
  return Object.values(UserRoleEnum).filter(
    (role) => authorizedRoles.indexOf(role) === -1,
  );
}

function getRandomUnauthorizedRole(
  authorizedRoles: UserRoleEnum[],
): UserRoleEnum {
  const unauthorizedRoles = getUnauthorizedRoles(authorizedRoles);
  return faker.random.arrayElement(unauthorizedRoles);
}

export function cloneContextWithUnauthorizedRole<
  T extends RequireField<Partial<MyContext>, 'user'>
>(context: T, authorizedRoles: UserRoleEnum[]): T {
  const updatedContext = deepCopy(context);
  updatedContext.user.role = getRandomUnauthorizedRole(authorizedRoles);
  return updatedContext;
}
