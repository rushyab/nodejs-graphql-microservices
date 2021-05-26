import bcrypt from 'bcrypt';
import { IsDate, Length } from 'class-validator';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  AfterLoad,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SALT_ROUNDS } from '../../constants/common';
import {
  PASSWORD_MAX_CHARS,
  PASSWORD_MIN_CHARS,
} from '../../constants/validation';
import LoggerService from '../../utils/logger';
import { CreatedBy, UpdatedBy, UserRoleEnum } from './types';

/* eslint-disable */
type Constructor<T = {}> = new (...args: any[]) => T;

const logger = new LoggerService('CustomBaseEntities');

@ObjectType()
export class CustomBaseEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;
}

export function DatesBaseEntity<TBase extends Constructor>(Base: TBase) {
  @ObjectType()
  abstract class AbstractBase extends Base {
    @Field(() => CreatedBy)
    @Column({ type: 'json' })
    createdBy: CreatedBy;

    @Field()
    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdTimeStamp: Date;

    @Field(() => UpdatedBy, { nullable: true })
    @Column({ nullable: true, type: 'json' })
    updatedBy: UpdatedBy;

    @Field({ nullable: true })
    @Column({ nullable: true })
    @IsDate()
    updatedTimeStamp: Date;
  }

  return AbstractBase;
}

export function UserBaseEntity<TBase extends Constructor>(
  defaultRole: UserRoleEnum,
  Base: TBase,
) {
  @ObjectType()
  abstract class AbstractBase extends Base {
    private existingPassword: string;

    @Column({ nullable: true })
    @Length(PASSWORD_MIN_CHARS, PASSWORD_MAX_CHARS)
    password: string;

    @AfterLoad()
    loadExisitingPassword(): void {
      this.existingPassword = this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
      // Check if password has changed
      if (this.password && this.password !== this.existingPassword) {
        try {
          this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        } catch (err) {
          logger.error(`A error occurred while hashing password ${err}`);

          throw new Error('Server error');
        }
      }
    }

    @Column({ nullable: true, default: null })
    unsuccessfullLoginAttempts: number;

    @Column({ nullable: true, default: null })
    lastUnsuccessfullLoginAttempt: Date;

    @Field()
    @Column({ default: true })
    isActive: boolean;

    @Field(() => UserRoleEnum)
    @Column({ type: 'enum', enum: UserRoleEnum, default: defaultRole })
    role: UserRoleEnum;
  }

  return AbstractBase;
}
