import DataLoader, { BatchLoadFn } from 'dataloader';
import { In } from 'typeorm';
import BlogAdminEntity from '../database/entities/BlogAdmin';
import LoggerService from '../utils/logger';

const logger = new LoggerService('BlogAdminLoader');

const batchBlogAdmin: BatchLoadFn<string, BlogAdminEntity> = async (ids) => {
  const numericIds = ids.map((id) => parseInt(id, 10));

  logger.info('IDs to be loaded', ids);

  const users = await BlogAdminEntity.find({
    where: { id: In(numericIds) },
  });

  const idUserMap: { [key: number]: BlogAdminEntity } = {};

  users.forEach((user) => {
    idUserMap[user.id] = user;
  });

  return numericIds.map((id) => idUserMap[id]);
};

const blogAdminLoader = (): DataLoader<string, BlogAdminEntity> =>
  new DataLoader(batchBlogAdmin);

export default blogAdminLoader;
