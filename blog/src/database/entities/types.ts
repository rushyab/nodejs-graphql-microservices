import {
  createUnionType,
  Field,
  ObjectType,
  registerEnumType
} from 'type-graphql';
import BlogAdminEntity from './BlogAdmin';
import SuperAdminEntity from './SuperAdmin';

// Note: Also referred in other services. Update all the references
export enum UserRoleEnum {
  Student = 'Student',
  SuperAdmin = 'SuperAdmin',
  BlogAdmin = 'BlogAdmin',
}

registerEnumType(UserRoleEnum, {
  name: 'UserRoleEnum',
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

export const Author = createUnionType({
  name: 'Author',
  types: () => [BlogAdminEntity, SuperAdminEntity] as const,
  // our implementation of detecting returned object type
  resolveType: (value: BlogAdminEntity | SuperAdminEntity) => {
    if (value.role === UserRoleEnum.SuperAdmin) {
      return SuperAdminEntity;
    }
    if (value.role === UserRoleEnum.BlogAdmin) {
      return BlogAdminEntity;
    }
    return undefined;
  },
});
