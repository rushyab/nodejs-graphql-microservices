import { IsJWT, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import {
  EMAIL_OR_MOBILE_VALIDATION_MESSAGE,
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS,
} from '../../../constants/validation';
import {
  UserRoleEnum,
  VerificationTypeEnum,
} from '../../../database/entities/types';
import { IsEmailOrMobile } from '../../../utils/cutomClassValidatorDecorators';

@InputType()
export class SendVerificationCodeInput {
  @Field()
  @IsEmailOrMobile({
    message: EMAIL_OR_MOBILE_VALIDATION_MESSAGE,
  })
  emailOrMobile: string;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;

  @Field(() => VerificationTypeEnum)
  verificationType: VerificationTypeEnum;
}

@InputType()
export class VerifyCodeInput {
  @Field()
  @IsEmailOrMobile({
    message: EMAIL_OR_MOBILE_VALIDATION_MESSAGE,
  })
  emailOrMobile: string;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;

  @Field()
  @Length(4, 8)
  code: string;

  @Field(() => VerificationTypeEnum)
  verificationType: VerificationTypeEnum;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsEmailOrMobile({
    message: EMAIL_OR_MOBILE_VALIDATION_MESSAGE,
  })
  emailOrMobile: string;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;

  @Field()
  @Length(4, 8)
  code: string;

  @Field()
  @IsJWT({ message: 'Please send a valid verification token' })
  token: string;

  @Field()
  @Length(PASSWORD_MIN_CHARS, PASSWORD_MAX_CHARS)
  newPassword: string;
}
