import { Directive, Field, ID, ObjectType } from 'type-graphql';
import { UserRoleEnum } from './types';

@Directive('@extends')
@Directive(`@key(fields: "id")`)
@ObjectType()
export default class SuperAdminEntity {
  @Directive('@external')
  @Field(() => ID)
  id: number;

  @Directive('@external')
  @Field(() => UserRoleEnum)
  role: UserRoleEnum;

  @Directive('@requires(fields: "role")')
  @Field({ nullable: true })
  _?: string;
}
