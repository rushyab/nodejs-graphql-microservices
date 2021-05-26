import { Factory, Seeder } from 'typeorm-seeding';
import BlogEntity from '../entities/Blog';

export default class CreateBlogSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(BlogEntity)().createMany(10);
  }
}
