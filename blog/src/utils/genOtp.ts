/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import otpGenerator from 'otp-generator';

type Options = {
  digits?: boolean;
  alphabets?: boolean;
  upperCase?: boolean;
  specialChars?: boolean;
};

const defaultOptions: Options = {
  digits: true,
  alphabets: false,
  upperCase: false,
  specialChars: false,
};

/**
 * Generate one time password
 * @param {Number} length length of password. default length is 6.
 * @param {Options} options
 * @param {Boolean} options.digits - Default: true true value includes digits in OTP
 * @param {Boolean} options.alphabets - Default: false true value includes alphabets in OTP
 * @param {Boolean} options.upperCase - Default: false true value includes uppercase alphabets in OTP
 * @param {Boolean} options.specialChars - Default: false true value includes special Characters in OTP
 *
 */
export default function genOtp(length = 6, options: Options = {}): string {
  return otpGenerator.generate(length, {
    ...defaultOptions,
    ...options,
  });
}
