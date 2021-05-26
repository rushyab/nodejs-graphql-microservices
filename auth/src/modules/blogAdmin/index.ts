import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import BlogAdminEntity from '../../database/entities/BlogAdmin';
import { MyContext } from '../context';
import resolvers from './resolvers';
import {
  BlogAdminAuth,
  BlogAdminLoginInput,
  BlogAdminRegisterInput,
} from './types';

const { blogAdminRegister, blogAdminLogin } = resolvers;

@Resolver(() => BlogAdminEntity)
export default class BlogAdminResolver {
  @Mutation(() => BlogAdminAuth)
  async blogAdminRegister(
    @Arg('registerInfo') registerInfo: BlogAdminRegisterInput,
    @Ctx() ctx: MyContext,
  ): Promise<BlogAdminAuth> {
    return blogAdminRegister(registerInfo, ctx);
  }

  @Mutation(() => BlogAdminAuth)
  async blogAdminLogin(
    @Arg('loginInfo') loginInfo: BlogAdminLoginInput,
    @Ctx() ctx: MyContext,
  ): Promise<BlogAdminAuth> {
    return blogAdminLogin(loginInfo, ctx);
  }
}
