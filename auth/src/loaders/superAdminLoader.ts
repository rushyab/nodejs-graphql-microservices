import { In } from 'typeorm';
import SuperAdminEntity from '../database/entities/SuperAdmin';
import DataLoader, { BatchLoadFn } from 'dataloader';
import LoggerService from '../utils/logger';

const logger = new LoggerService('SuperAdminLoader');

const batchSuperAdmin: BatchLoadFn<string, SuperAdminEntity> = async (ids) => {
  const numericIds = ids.map((id) => parseInt(id, 10));

  logger.info('IDs to be loaded', ids);

  const users = await SuperAdminEntity.find({
    where: { id: In(numericIds) },
  });

  const idUserMap: { [key: number]: SuperAdminEntity } = {};

  users.forEach((user) => {
    idUserMap[user.id] = user;
  });

  return numericIds.map((id) => idUserMap[id]);
};

const superAdminLoader = (): DataLoader<string, SuperAdminEntity> =>
  new DataLoader(batchSuperAdmin);

export default superAdminLoader;
