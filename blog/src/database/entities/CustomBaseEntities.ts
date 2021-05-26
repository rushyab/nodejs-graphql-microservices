/* eslint-disable */
import { IsDate } from 'class-validator';
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CreatedBy, UpdatedBy } from './types';

type Constructor<T = {}> = new (...args: any[]) => T;

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
    @IsDate()
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
