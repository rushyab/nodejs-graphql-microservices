import { IsEmail, Length, Matches } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { NAME_REG_EXP } from '../../../constants/regExp';
import {
  EMAIL_VALIDATION_MESSAGE,
  NAME_MAX_CHARS,
  NAME_MIN_CHARS,
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS,
} from '../../../constants/validation';
import BlogAdminEntity from '../../../database/entities/BlogAdmin';
import { IsEmailExists } from '../../../utils/cutomClassValidatorDecorators';

@InputType()
export default class BlogAdminRegisterInput {
  @Field()
  @Length(NAME_MIN_CHARS, NAME_MAX_CHARS)
  @Matches(NAME_REG_EXP, { message: 'Name is invalid' })
  name: string;

  @Field()
  @IsEmail(undefined, { message: EMAIL_VALIDATION_MESSAGE })
  @IsEmailExists(BlogAdminEntity, { message: 'Email already in use' })
  email: string;

  @Field()
  @Length(PASSWORD_MIN_CHARS, PASSWORD_MAX_CHARS)
  password: string;
}
