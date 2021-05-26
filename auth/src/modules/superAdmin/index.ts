import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { MyContext } from '../context';
import resolvers from './resolvers';
import {
  SuperAdminAuth,
  SuperAdminLoginInput,
  SuperAdminRegisterInput,
} from './types';

const { superAdminRegister, superAdminLogin } = resolvers;

@Resolver()
export default class SuperAdminResolver {
  @Mutation(() => SuperAdminAuth)
  async superAdminRegister(
    @Arg('registerInfo') registerInfo: SuperAdminRegisterInput,
    @Ctx() ctx: MyContext,
  ): Promise<SuperAdminAuth> {
    return superAdminRegister(registerInfo, ctx);
  }

  @Mutation(() => SuperAdminAuth)
  async superAdminLogin(
    @Arg('loginInfo') loginInfo: SuperAdminLoginInput,
    @Ctx() ctx: MyContext,
  ): Promise<SuperAdminAuth> {
    return superAdminLogin(loginInfo, ctx);
  }
}
