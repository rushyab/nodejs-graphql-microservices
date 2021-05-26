import { Factory, Seeder } from 'typeorm-seeding';
import BlogAdminEntity from '../entities/BlogAdmin';

export default class CreateBlogAdminSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(BlogAdminEntity)().createMany(10);
  }
}
