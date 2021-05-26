import faker from 'faker';
import { define } from 'typeorm-seeding';
import { PASSWORD_MIN_CHARS } from '../../constants/validation';
import BlogAdminEntity from '../entities/BlogAdmin';
import { UserRoleEnum } from '../entities/types';

define(BlogAdminEntity, () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const name = `${firstName} ${lastName}`;
  const email = faker.unique(faker.internet.email, [firstName, lastName]);
  const password = faker.internet.password(PASSWORD_MIN_CHARS);
  const createdBy = {
    id: 1,
    role: UserRoleEnum.SuperAdmin,
  };
  return BlogAdminEntity.create({
    email,
    name,
    password,
    createdBy,
  });
});
