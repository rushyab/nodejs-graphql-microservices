import { Field, ObjectType } from 'type-graphql';
import SuperAdminEntity from '../../../database/entities/SuperAdmin';

export { default as SuperAdminLoginInput } from './loginInput';
export { default as SuperAdminRegisterInput } from './registerInput';

@ObjectType()
export class SuperAdminAuth {
  @Field()
  token: string;

  @Field()
  superAdmin: SuperAdminEntity;
}
