import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import {
  EMAIL_VALIDATION_MESSAGE,
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS,
} from '../../../constants/validation';
import SuperAdminEntity from '../../../database/entities/SuperAdmin';
import { IsEmailExists } from '../../../utils/cutomClassValidatorDecorators';

@InputType()
export default class SuperAdminRegisterInput {
  @Field()
  @IsEmail(undefined, { message: EMAIL_VALIDATION_MESSAGE })
  @IsEmailExists(SuperAdminEntity, { message: 'Email already in use' })
  email: string;

  @Field()
  @Length(PASSWORD_MIN_CHARS, PASSWORD_MAX_CHARS)
  password: string;

  @Field()
  @IsNotEmpty()
  key: string;
}
