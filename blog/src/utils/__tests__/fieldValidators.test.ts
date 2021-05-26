import faker from 'faker';
import { cExpect } from '../../tests/utils';
import {
  containsOnlyDigits,
  isEmail,
  isMobileNumber,
} from '../fieldValidators';

describe('field validators', () => {
  describe('email validator', () => {
    it('should return false for invalid email combinations', () => {
      const invalidEmailInputs = [
        '',
        undefined,
        null,
        1,
        '@sample.co',
        'xyz@xyz.z',
      ];
      invalidEmailInputs.forEach((val) => {
        const result = isEmail(val);

        cExpect(result).to.be.false;
      });
    });

    it('should return true for valid email', () => {
      const result = isEmail(faker.internet.email());
      cExpect(result).to.be.true;
    });
  });

  describe('mobile validator', () => {
    it('should return false for invalid mobile combinations', () => {
      const invalidMobileInputs = [
        '',
        undefined,
        null,
        1,
        '98765432.1',
        faker.phone.phoneNumber('1#########'),
        faker.phone.phoneNumber('2#########'),
        faker.phone.phoneNumber('9########'),
        faker.phone.phoneNumber('9##########'),
      ];

      invalidMobileInputs.forEach((val) => {
        const result = isMobileNumber(val);

        cExpect(result).to.be.false;
      });
    });

    it('should return true for valid mobile combinations', () => {
      const validMobileInputs = [
        faker.phone.phoneNumber('9#########'),
        faker.phone.phoneNumber('8#########'),
        faker.phone.phoneNumber('7#########'),
        faker.phone.phoneNumber('6#########'),
      ];

      validMobileInputs.forEach((val: string) => {
        const result = isMobileNumber(val);

        cExpect(result).to.be.true;
      });
    });
  });

  describe('digits validator', () => {
    it('should return false for invalid inputs', () => {
      const invalidInputs = ['', null, undefined, true, '1.02', '123e'];
      invalidInputs.forEach((val) => {
        const result = containsOnlyDigits(val);

        cExpect(result).to.be.false;
      });
    });

    it('should return true for valid inputs', () => {
      const validInputs = [0, 1, '0', 234, '23456'];
      validInputs.forEach((val: string | number) => {
        const result = containsOnlyDigits(val);

        cExpect(result).to.be.true;
      });
    });
  });
});
