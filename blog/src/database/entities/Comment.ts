import { IsDate, Length } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import {
  BLOG_TITLE_MAX_LEN,
  BLOG_TITLE_MIN_LEN,
} from '../../constants/validation';
import BlogEntity from './Blog';
import BlogAdminEntity from './BlogAdmin';
import { CustomBaseEntity } from './CustomBaseEntities';
import SuperAdminEntity from './SuperAdmin';
import { Author } from './types';

@ObjectType()
@Entity({ name: 'comment' })
export default class CommentEntity extends CustomBaseEntity {
  @Field()
  @Column()
  @Length(BLOG_TITLE_MIN_LEN, BLOG_TITLE_MAX_LEN)
  body: string;

  @Field(() => Author, { nullable: true })
  @Column('json')
  author?: SuperAdminEntity | BlogAdminEntity;

  @Field(() => BlogEntity)
  @ManyToOne(() => BlogEntity, (blog) => blog.comments, {
    onDelete: 'CASCADE',
  })
  blog: BlogEntity;

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  createdTimeStamp: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @IsDate()
  updatedTimeStamp: Date;
}
