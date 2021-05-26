import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';
import BlogEntity from '../../database/entities/Blog';
import CommentEntity from '../../database/entities/Comment';
import { UserRoleEnum } from '../../database/entities/types';
import { MyContext } from '../context';
import { AddCommentInput } from './types';

@Resolver()
export default class CommentResolver {
  @Authorized<UserRoleEnum>([UserRoleEnum.SuperAdmin, UserRoleEnum.BlogAdmin])
  @Mutation(() => CommentEntity)
  async addComment(
    @Arg('commentInfo') { body, blogId }: AddCommentInput,
    @Ctx() ctx: MyContext,
  ): Promise<CommentEntity> {
    const { user } = ctx;
    const authorId = user?.userId;
    const authorRole = user?.role;

    const blog = await BlogEntity.findOne(blogId);

    if (!blog) {
      throw new Error('Blog not found!');
    }

    return CommentEntity.create({
      body,
      blog,
      author: {
        id: authorId,
        role: authorRole,
      },
      createdTimeStamp: new Date(),
    }).save();
  }
}
