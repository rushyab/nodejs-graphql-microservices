import { IsJWT, Length } from 'class-validator';
import { Column, Entity, Unique } from 'typeorm';
import { CustomBaseEntity } from './CustomBaseEntities';
import { UserRoleEnum, VerificationTypeEnum } from './types';

@Entity({ name: 'verification_tracker' })
@Unique(['emailOrMobile', 'role', 'verificationType'])
export default class VerificationTrackerEntity extends CustomBaseEntity {
  @Column()
  emailOrMobile: string;

  @Column({ type: 'enum', enum: UserRoleEnum })
  role: UserRoleEnum;

  @Column({ type: 'enum', enum: VerificationTypeEnum })
  verificationType: VerificationTypeEnum;

  @Column()
  @Length(4, 8)
  code: string;

  @Column()
  @IsJWT()
  token: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdTimeStamp: Date;

  @Column()
  sendVerificationCodeAttempts: number;

  @Column()
  lastVerificationCodeSent: Date;

  @Column({ nullable: true })
  verificationAttempts: number;

  @Column({ nullable: true })
  lastVerificationAttempt: Date;
}
