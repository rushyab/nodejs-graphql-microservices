import { Field, ObjectType } from 'type-graphql';
import StudentEntity from '../../../database/entities/Student';
export { default as StudentRegisterInput } from './registerInput';

@ObjectType()
export class StudentAuth {
  @Field()
  token: string;

  @Field()
  student: StudentEntity;
}
