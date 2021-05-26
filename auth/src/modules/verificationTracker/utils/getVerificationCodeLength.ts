import {
  OTP_LENGTH,
  RESET_PASSWORD_CODE_LENGTH,
} from '../../../constants/common';
import { VerificationTypeEnum } from '../../../database/entities/types';

export default function getVerificationCodeLength(
  verificationType: VerificationTypeEnum,
): number | undefined {
  let codeLength;

  switch (verificationType) {
    case VerificationTypeEnum.LoginOTP:
      codeLength = OTP_LENGTH;
      break;
    case VerificationTypeEnum.ResetPassword:
      codeLength = RESET_PASSWORD_CODE_LENGTH;
      break;
    default:
      codeLength = undefined;
  }

  return codeLength;
}
