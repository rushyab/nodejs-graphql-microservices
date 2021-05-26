import {
  DIGITS_REG_EXP,
  EMAIL_REG_EXP,
  MOBILE_REG_EXP,
} from '../constants/regExp';

function isEmail(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  return EMAIL_REG_EXP.test(val);
}

function isMobileNumber(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  return MOBILE_REG_EXP.test(val);
}

function isEmailOrMobile(val: unknown): boolean {
  return isEmail(val) || isMobileNumber(val);
}

function containsOnlyDigits<T>(val: T): boolean {
  return DIGITS_REG_EXP.test(`${val}`);
}

export { isEmail, isMobileNumber, isEmailOrMobile, containsOnlyDigits };
