import { Field, ObjectType } from 'type-graphql';
import BlogAdminEntity from '../../../database/entities/BlogAdmin';

export { default as BlogAdminRegisterInput } from './registerInput';
export { default as BlogAdminLoginInput } from './loginInput';

@ObjectType()
export class BlogAdminAuth {
  @Field()
  token: string;

  @Field()
  blogAdmin: BlogAdminEntity;
}
