import { getVerificationCodeLength, verificationAttemptsUtil } from '.';
import { JWT_DEFAULT_SECRET } from '../../../config';
import { VERIFICATION_CODE_VALID_FOR_IN_MINUTES } from '../../../constants/common';
import VerificationTrackerEntity from '../../../database/entities/VerificationTracker';
import { isEmailOrMobile } from '../../../utils/fieldValidators';
import genOtp from '../../../utils/genOtp';
import LoggerService from '../../../utils/logger';
import tokenUtil from '../../../utils/tokenHandler';
import { SendVerificationCodeInput } from '../types';
const { checkSendVerificationCodeAttempts } = verificationAttemptsUtil;

const logger = new LoggerService('CreateVerificationTrackerUtil');

async function createVerificationTracker({
  emailOrMobile,
  role,
  verificationType,
}: SendVerificationCodeInput): Promise<VerificationTrackerEntity> {
  if (!isEmailOrMobile(emailOrMobile)) {
    throw new Error('Invalid email or mobile');
  }

  // Check if tracker exists for the user and verificationType
  const verificationTracker = await VerificationTrackerEntity.findOne({
    emailOrMobile,
    role,
    verificationType,
  });

  // Generate code and token
  const codeLength = getVerificationCodeLength(verificationType);
  if (!codeLength) {
    logger.error(
      `createVerificationTracker: codeLength is not defined for verificationType: ${verificationType}`,
    );
    throw new Error("Server error: verification code couldn't be generated");
  }
  const code = genOtp(codeLength);
  const token = await tokenUtil.createToken(
    { emailOrMobile, role },
    JWT_DEFAULT_SECRET,
    { expiresIn: `${VERIFICATION_CODE_VALID_FOR_IN_MINUTES}m` },
  );

  let tracker: VerificationTrackerEntity;
  if (verificationTracker) {
    // If resend, update existing tracker

    tracker = verificationTracker;
    tracker.code = code;
    tracker.token = token;
    tracker.createdTimeStamp = new Date();
  } else {
    // Create new tacker

    tracker = VerificationTrackerEntity.create({
      emailOrMobile,
      role,
      code,
      token,
      verificationType,
    });
  }

  await checkSendVerificationCodeAttempts(tracker);

  return VerificationTrackerEntity.save(tracker);
}

export { createVerificationTracker, createVerificationTracker as default };
