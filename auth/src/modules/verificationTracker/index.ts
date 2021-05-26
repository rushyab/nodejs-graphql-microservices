import { Arg, Mutation, Resolver } from 'type-graphql';
import resolvers from './resolvers';
import {
  ResetPasswordInput,
  SendVerificationCodeInput,
  VerifyCodeInput,
} from './types';

const { sendVerificationCode, verifyCode, resetPassword } = resolvers;

@Resolver()
export default class VerificationTrackerResolver {
  @Mutation(() => Boolean, {
    description:
      'Creates a verification tracker for the user depending on the verification type, and sends the code to the user.',
  })
  async sendVerificationCode(
    @Arg('sendVerificationCodeInfo')
    sendVerificationCodeInfo: SendVerificationCodeInput,
  ): Promise<true> {
    return sendVerificationCode(sendVerificationCodeInfo);
  }

  @Mutation(() => String, {
    description: 'Validates the code and returns the associated token.',
  })
  async verifyCode(
    @Arg('verifyCodeInfo')
    verifyCodeInfo: VerifyCodeInput,
  ): Promise<string> {
    const verificationTracker = await verifyCode(verifyCodeInfo);
    return verificationTracker.token;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Arg('resetPasswordInfo')
    resetPasswordInfo: ResetPasswordInput,
  ): Promise<true> {
    return resetPassword(resetPasswordInfo);
  }
}
