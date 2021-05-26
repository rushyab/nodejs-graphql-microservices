import { createConnection, getConnection } from 'typeorm';
import { runSeeder, useRefreshDatabase, useSeeding } from 'typeorm-seeding';
import CreateBlogAdminSeed from '../database/seeds/blogAdmin.seed';
import CreateSuperAdminSeed from '../database/seeds/superAdmin.seed';
import { testDbConfig } from '../ormconfig';

/**
 * To configure the path to your seeds and factories change the TypeORM config file (ormconfig.js or ormconfig.json).
 * The default paths are src/database/{seeds,factories}/**\/*{.ts,.js}
 * ormconfig.js
 * module.exports = {
 *  ...
 *  seeds: ['src/seeds/**\/*{.ts,.js}'],
 *  factories: ['src/factories/**\/*{.ts,.js}'],
 * }
 *
 * https://github.com/w3tecch/typeorm-seeding
 */

async function seedTestData() {
  await createConnection(testDbConfig);

  await useRefreshDatabase({
    connection: 'default',
    // configName: 'testDbConfig.json',
    // root: `${__dirname}`,
  });

  await useSeeding();

  await runSeeder(CreateSuperAdminSeed);
  await runSeeder(CreateBlogAdminSeed);
}

seedTestData()
  .then(() => getConnection().close())
  .catch((err) => console.error(err));
