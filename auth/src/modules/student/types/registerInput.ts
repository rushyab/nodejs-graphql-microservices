import { IsMobilePhone, IsOptional, Length, Matches } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { NAME_REG_EXP } from '../../../constants/regExp';
import {
  MOBILE_VALIDATION_MESSAGE,
  NAME_MAX_CHARS,
  NAME_MIN_CHARS,
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS,
} from '../../../constants/validation';

@InputType()
export default class StudentRegisterInput {
  @Field(() => String, { nullable: true })
  @Length(NAME_MIN_CHARS, NAME_MAX_CHARS)
  @IsOptional()
  @Matches(NAME_REG_EXP, { message: 'First name is invalid' })
  firstName?: string | null;

  @Field(() => String, { nullable: true })
  @Length(NAME_MIN_CHARS, NAME_MAX_CHARS)
  @IsOptional()
  @Matches(NAME_REG_EXP, { message: 'Last name is invalid' })
  lastName?: string | null;

  @Field()
  @Length(10, 10, {
    message: MOBILE_VALIDATION_MESSAGE,
  })
  @IsMobilePhone(
    'en-IN',
    { strictMode: false },
    { message: MOBILE_VALIDATION_MESSAGE },
  )
  mobile: string;

  @Field()
  @Length(PASSWORD_MIN_CHARS, PASSWORD_MAX_CHARS)
  password: string;
}
