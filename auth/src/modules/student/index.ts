import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import StudentEntity from '../../database/entities/Student';
import { UserRoleEnum } from '../../database/entities/types';
import tokenUtil from '../../utils/tokenHandler';
import { MyContext } from '../context';
import { StudentAuth, StudentRegisterInput } from './types';

@Resolver()
export default class StudentResolver {
  @Mutation(() => StudentAuth)
  async studentRegister(
    @Arg('registerInfo')
    { firstName, lastName, mobile, password }: StudentRegisterInput,
    @Ctx() ctx: MyContext,
  ): Promise<StudentAuth> {
    const student = await StudentEntity.create({
      firstName,
      lastName,
      mobile,
      password,
      createdBy: {
        role: UserRoleEnum.Student,
      },
    }).save();

    const token = await tokenUtil.setRefreshAndGetAccessToken(ctx.res, {
      userId: student.id,
      role: UserRoleEnum.Student,
    });
    return { token, student };
  }
}
