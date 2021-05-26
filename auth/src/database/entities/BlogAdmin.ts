import { IsEmail, Length } from 'class-validator';
import { Directive, Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { NAME_MAX_CHARS, NAME_MIN_CHARS } from '../../constants/validation';
import {
  CustomBaseEntity,
  DatesBaseEntity,
  UserBaseEntity,
} from './CustomBaseEntities';
import { UserRoleEnum } from './types';

@ObjectType()
@Directive(`@key(fields: "id")`)
@Entity({ name: 'blog_admin' })
export default class BlogAdminEntity extends DatesBaseEntity(
  UserBaseEntity(UserRoleEnum.BlogAdmin, CustomBaseEntity),
) {
  @Field()
  @Column()
  @Length(NAME_MIN_CHARS, NAME_MAX_CHARS)
  name: string;

  @Field()
  @Column({ unique: true })
  @IsEmail()
  email: string;
}
