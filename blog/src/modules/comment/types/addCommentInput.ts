import { Length, Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import {
    COMMENT_BODY_MAX_LEN,
    COMMENT_BODY_MIN_LEN
} from '../../../constants/validation';

@InputType()
export default class AddCommentInput {
  @Field()
  @Length(COMMENT_BODY_MIN_LEN, COMMENT_BODY_MAX_LEN)
  body: string;

  @Field()
  @Min(1)
  blogId: number;
}
