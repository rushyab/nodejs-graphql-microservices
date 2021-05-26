import { AuthenticationError } from 'apollo-server-express';
import moment from 'moment';
import { getConnection } from 'typeorm';
import { VERIFICATION_CODE_VALID_FOR_IN_MINUTES } from '../../constants/common';
import BlogAdminEntity from '../../database/entities/BlogAdmin';
import StudentEntity from '../../database/entities/Student';
import SuperAdminEntity from '../../database/entities/SuperAdmin';
import { VerificationTypeEnum } from '../../database/entities/types';
import VerificationTrackerEntity from '../../database/entities/VerificationTracker';
import { isEmail } from '../../utils/fieldValidators';
import { findUserByUniqueFieldAndRoleOrFail } from '../../utils/findUser';
import LoggerService from '../../utils/logger';
import {
  ResetPasswordInput,
  SendVerificationCodeInput,
  VerifyCodeInput,
} from './types';
import {
  sendVerificationCodeToEmailOrMobile,
  verificationAttemptsUtil,
} from './utils';
import createVerificationTracker from './utils/createVerificationTracker';

const { checkInvalidVerificationAttempts } = verificationAttemptsUtil;

const logger = new LoggerService('VerificationTrackerResolvers');

async function sendVerificationCode({
  emailOrMobile,
  role,
  verificationType,
}: SendVerificationCodeInput): Promise<true> {
  const fieldType = isEmail(emailOrMobile) ? 'email' : 'mobile';

  // Find user
  try {
    await findUserByUniqueFieldAndRoleOrFail(fieldType, emailOrMobile, role);
  } catch (error) {
    logger.error('CreateAndSendCode', error);
    throw new Error('User not found');
  }

  // Generate and save the code
  const verificationTracker = await createVerificationTracker({
    emailOrMobile,
    role,
    verificationType,
  });

  // Send code
  sendVerificationCodeToEmailOrMobile(
    emailOrMobile,
    verificationTracker.code,
    verificationType,
  ).catch((err) =>
    logger.error('Error occurred while sending verification code', {
      error: err.toString(),
    }),
  );

  return true;
}

export async function verifyCode({
  code,
  emailOrMobile,
  role,
  verificationType,
}: VerifyCodeInput): Promise<VerificationTrackerEntity> {
  const verificationTracker = await VerificationTrackerEntity.findOne({
    emailOrMobile,
    role,
    verificationType,
  });

  if (!verificationTracker) {
    throw new Error('Verifcation code not found/ expired. Try resending');
  }

  const verificationTimeDiff = moment(new Date()).diff(
    moment(verificationTracker.createdTimeStamp),
    'minutes',
  );

  // Remove verification tracker info if verification attempt is after expiry time
  if (verificationTimeDiff > VERIFICATION_CODE_VALID_FOR_IN_MINUTES) {
    await verificationTracker.remove();

    throw new Error('Verifcation code not found/ expired. Try resending');
  }

  await checkInvalidVerificationAttempts(verificationTracker, code);

  return verificationTracker;
}

async function resetPassword({
  emailOrMobile,
  role,
  newPassword,
  code,
  token,
}: ResetPasswordInput): Promise<true> {
  const fieldType = isEmail(emailOrMobile) ? 'email' : 'mobile';

  let user: SuperAdminEntity | BlogAdminEntity | StudentEntity;

  // Find user
  try {
    user = await findUserByUniqueFieldAndRoleOrFail(
      fieldType,
      emailOrMobile,
      role,
    );
  } catch (error) {
    logger.error('resetPassword: find user', error);
    throw new Error('User not found');
  }

  // Verify code
  const verificationTracker = await verifyCode({
    code,
    emailOrMobile,
    role,
    verificationType: VerificationTypeEnum.ResetPassword,
  });

  // Verify token
  if (verificationTracker.token !== token) {
    logger.error("resetPassword: tokens don't match");
    throw new AuthenticationError('Not Authorized');
  }

  // Change password
  user.password = newPassword;

  // Save updated password and delete verified tracker
  await getConnection().transaction(async (transactionalEntityManager) => {
    await transactionalEntityManager.save(user);

    await transactionalEntityManager.remove(verificationTracker);
  });

  return true;
}

export default {
  sendVerificationCode,
  verifyCode,
  resetPassword,
};
