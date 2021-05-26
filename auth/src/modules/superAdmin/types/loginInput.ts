import { IsEmail, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import {
  EMAIL_VALIDATION_MESSAGE,
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS
} from '../../../constants/validation';

@InputType()
export default class SuperAdminLoginInput {
  @Field()
  @IsEmail(undefined, { message: EMAIL_VALIDATION_MESSAGE })
  email: string;

  @Field()
  @Length(PASSWORD_MIN_CHARS, PASSWORD_MAX_CHARS)
  password: string;
}
