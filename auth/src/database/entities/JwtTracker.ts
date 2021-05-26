import { IsDate, IsJWT } from 'class-validator';
import { ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from './CustomBaseEntities';
import { UserRoleEnum } from './types';

@ObjectType()
@Entity({ name: 'jwt_tracker' })
export class JwtTrackerEntity extends CustomBaseEntity {
  @Column()
  userId: number;

  @Column({ unique: true })
  @IsJWT()
  token: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdTimeStamp: Date;

  @Column()
  userRole: UserRoleEnum;

  @Column()
  @IsDate()
  expiryTime: Date;
}
