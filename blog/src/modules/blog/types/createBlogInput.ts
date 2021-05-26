import { Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import {
  BLOG_CONTENT_MAX_LEN,
  BLOG_CONTENT_MIN_LEN,
  BLOG_TITLE_MAX_LEN,
  BLOG_TITLE_MIN_LEN,
} from '../../../constants/validation';

@InputType()
export default class CreateBlogInput {
  @Field()
  @Length(BLOG_TITLE_MIN_LEN, BLOG_TITLE_MAX_LEN)
  title: string;

  @Field()
  @Length(BLOG_CONTENT_MIN_LEN, BLOG_CONTENT_MAX_LEN)
  content: string;
}
