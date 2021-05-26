import { GraphQLResolveInfo } from 'graphql';
import {
  Arg,
  Authorized,
  Ctx,
  Info,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import BlogEntity from '../../database/entities/Blog';
import { UserRoleEnum } from '../../database/entities/types';
import doesPathExist from '../../utils/doesPathExist';
import { MyContext } from '../context';
import { CreateBlogInput } from './types';

@Resolver(() => BlogEntity)
export default class BlogResolver {
  @Authorized([UserRoleEnum.SuperAdmin, UserRoleEnum.BlogAdmin])
  @Mutation(() => BlogEntity)
  async createBlog(
    @Arg('blogInfo') { title, content }: CreateBlogInput,
    @Ctx() ctx: MyContext,
  ): Promise<BlogEntity> {
    const { user } = ctx;
    const authorId = user?.userId;
    const authorRole = user?.role;

    const blog = await BlogEntity.create({
      title,
      content,
      author: {
        id: authorId,
        role: authorRole,
      },
      createdBy: { role: authorRole, id: authorId },
    }).save();

    return blog;
  }

  @Authorized([UserRoleEnum.SuperAdmin, UserRoleEnum.BlogAdmin])
  @Query(() => [BlogEntity])
  async getAllBlogs(
    @Info() info: GraphQLResolveInfo,
    @Arg('skip', { nullable: true, defaultValue: 0 }) skip?: number,
    @Arg('limit', { nullable: true, defaultValue: 10 }) limit?: number,
  ): Promise<BlogEntity[]> {
    const shouldJoinCommentsTable = doesPathExist(info.fieldNodes, [
      'getAllBlogs',
      'comments',
    ]);

    const relations: string[] = [];

    if (shouldJoinCommentsTable) {
      relations.push('comments');
    }

    const blogs = await BlogEntity.find({
      skip,
      take: limit,
      relations,
    });

    return blogs;
  }
}
