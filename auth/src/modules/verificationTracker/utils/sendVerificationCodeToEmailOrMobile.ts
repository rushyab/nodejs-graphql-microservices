import { isEmail } from 'class-validator';
import { getVerificationCodeLength } from '.';
import { VerificationTypeEnum } from '../../../database/entities/types';
import {
  isMobileNumber,
  containsOnlyDigits,
} from '../../../utils/fieldValidators';
import LoggerService from '../../../utils/logger';
import sendMail from '../../../utils/sendMail';

const logger = new LoggerService('SendVerificationCodeUtil');

export default async function sendVerificationCodeToEmailOrMobile(
  emailOrMobile: string,
  code: string,
  verificationType: VerificationTypeEnum,
): Promise<void> {
  const isEmailRes = isEmail(emailOrMobile);
  const isMobileRes = isMobileNumber(emailOrMobile);

  if (!isEmailRes && !isMobileRes) {
    throw new Error('Invalid email or mobile');
  }

  const codeLength = getVerificationCodeLength(verificationType);

  const codeContainsOnlyDigits = containsOnlyDigits(code);

  if (!codeLength || !codeContainsOnlyDigits || code.length !== codeLength) {
    logger.error('Invalid code/code length', {
      code,
      calculatedLength: codeLength,
      verificationType,
    });
    throw new Error('Invalid code');
  }

  if (isEmailRes) {
    logger.info('Send verification code to Mail', { code });

    await sendMail({
      to: emailOrMobile,
      templateName: 'reset_password',
      templateData: {
        code,
      },
    });
  } else {
    logger.info('Send verification code to Mobile', { code });
  }
}
