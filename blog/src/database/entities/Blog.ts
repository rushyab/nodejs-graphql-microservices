import { Length } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import {
  BLOG_CONTENT_MAX_LEN,
  BLOG_CONTENT_MIN_LEN,
  BLOG_TITLE_MAX_LEN,
  BLOG_TITLE_MIN_LEN,
} from '../../constants/validation';
import BlogAdminEntity from './BlogAdmin';
import CommentEntity from './Comment';
import { CustomBaseEntity, DatesBaseEntity } from './CustomBaseEntities';
import SuperAdminEntity from './SuperAdmin';
import { Author } from './types';

@ObjectType()
@Entity({ name: 'blog' })
export default class BlogEntity extends DatesBaseEntity(CustomBaseEntity) {
  @Field()
  @Column()
  @Length(BLOG_TITLE_MIN_LEN, BLOG_TITLE_MAX_LEN)
  title: string;

  @Column('text')
  @Field()
  @Length(BLOG_CONTENT_MIN_LEN, BLOG_CONTENT_MAX_LEN)
  content: string;

  @Field(() => Author, { nullable: true })
  @Column('json')
  author?: SuperAdminEntity | BlogAdminEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.blog)
  @Field(() => [CommentEntity])
  comments: CommentEntity[];
}
