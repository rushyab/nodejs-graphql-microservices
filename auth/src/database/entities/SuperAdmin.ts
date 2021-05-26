import { IsEmail } from 'class-validator';
import { Directive, Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { CustomBaseEntity, UserBaseEntity } from './CustomBaseEntities';
import { UserRoleEnum } from './types';

@ObjectType()
@Directive(`@key(fields: "id")`)
@Entity({ name: 'super_admin' })
export default class SuperAdminEntity extends UserBaseEntity(
  UserRoleEnum.SuperAdmin,
  CustomBaseEntity,
) {
  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdTimeStamp: Date;

  @Field()
  @Column({ unique: true })
  @IsEmail()
  email: string;
}
