import { IsMobilePhone, IsOptional, Length, Matches } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { NAME_REG_EXP } from '../../constants/regExp';
import {
  MOBILE_VALIDATION_MESSAGE,
  NAME_MAX_CHARS,
  NAME_MIN_CHARS,
} from '../../constants/validation';
import {
  CustomBaseEntity,
  DatesBaseEntity,
  UserBaseEntity,
} from './CustomBaseEntities';
import { UserRoleEnum } from './types';

@ObjectType()
@Entity({ name: 'student' })
export default class StudentEntity extends DatesBaseEntity(
  UserBaseEntity(UserRoleEnum.Student, CustomBaseEntity),
) {
  @Field()
  @Column({ unique: true })
  @Length(10, 10, {
    message: MOBILE_VALIDATION_MESSAGE,
  })
  @IsMobilePhone(
    'en-IN',
    { strictMode: false },
    { message: MOBILE_VALIDATION_MESSAGE },
  )
  mobile: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  @IsOptional()
  @Length(NAME_MIN_CHARS, NAME_MAX_CHARS)
  @Matches(NAME_REG_EXP, { message: 'First name is invalid' })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  @IsOptional()
  @Length(NAME_MIN_CHARS, NAME_MAX_CHARS)
  @Matches(NAME_REG_EXP, { message: 'Last name is invalid' })
  lastName: string | null;
}
