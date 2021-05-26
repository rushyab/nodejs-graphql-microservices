import { Field, ObjectType, registerEnumType } from 'type-graphql';

// Note: Also referred in other services. Update all the references
export enum UserRoleEnum {
  Student = 'Student',
  SuperAdmin = 'SuperAdmin',
  BlogAdmin = 'BlogAdmin',
}

registerEnumType(UserRoleEnum, {
  name: 'UserRoleEnum',
});

export enum VerificationTypeEnum {
  LoginOTP = 'LoginOTP',
  ResetPassword = 'ResetPassword',
}

registerEnumType(VerificationTypeEnum, {
  name: 'VerificationTypeEnum',
});

@ObjectType()
export abstract class CreatedBy {
  @Field({ nullable: true })
  id?: number;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;
}

@ObjectType()
export abstract class UpdatedBy {
  @Field()
  id: number;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;
}
