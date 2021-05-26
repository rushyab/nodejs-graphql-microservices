import { Factory, Seeder } from 'typeorm-seeding';
import SuperAdminEntity from '../entities/SuperAdmin';

export default class CreateSuperAdminSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(SuperAdminEntity)().createMany(10);
  }
}
