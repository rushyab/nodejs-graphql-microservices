import faker from 'faker';
import { define } from 'typeorm-seeding';
import { PASSWORD_MIN_CHARS } from '../../constants/validation';
import SuperAdminEntity from '../entities/SuperAdmin';

define(SuperAdminEntity, () => {
  const email = faker.unique(faker.internet.email);

  const password = faker.internet.password(PASSWORD_MIN_CHARS);

  return SuperAdminEntity.create({
    email,
    password,
  });
});
