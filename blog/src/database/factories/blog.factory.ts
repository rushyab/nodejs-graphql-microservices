import faker from 'faker';
import { define } from 'typeorm-seeding';
import BlogEntity from '../entities/Blog';
import { UserRoleEnum } from '../entities/types';

define(BlogEntity, () => {
  const title = faker.lorem.sentence(4);
  const content = faker.lorem.paragraph(10);
  const author = {
    id: faker.datatype.number({ min: 1, max: 10 }),
    role: faker.random.arrayElement([
      UserRoleEnum.SuperAdmin,
      UserRoleEnum.BlogAdmin,
    ]),
  };

  const createdBy = {
    id: 1,
    role: UserRoleEnum.SuperAdmin,
  };

  return BlogEntity.create({
    title,
    content,
    author,
    createdBy,
  });
});
