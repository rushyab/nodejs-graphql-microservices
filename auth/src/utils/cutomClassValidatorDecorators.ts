import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import BlogAdminEntity from '../database/entities/BlogAdmin';
import SuperAdminEntity from '../database/entities/SuperAdmin';
import { isEmailOrMobile } from './fieldValidators';

type TypeOfUserEntityWithEmailField =
  | typeof SuperAdminEntity
  | typeof BlogAdminEntity;

function genIsEmailExistsContraint(user: TypeOfUserEntityWithEmailField) {
  @ValidatorConstraint({ async: true })
  class IsEmailExistsConstraint implements ValidatorConstraintInterface {
    validate(email: string) {
      return user.findOne({ where: { email } }).then((userRes) => {
        if (userRes) return false;
        return true;
      });
    }
  }
  return IsEmailExistsConstraint;
}

function IsEmailExists(
  user: TypeOfUserEntityWithEmailField,
  validationOptions?: ValidationOptions,
) {
  return function runRegisterDecorator(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: Record<string, any>,
    propertyName: string,
  ): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: genIsEmailExistsContraint(user),
    });
  };
}

@ValidatorConstraint()
class IsEmailOrMobileConstraint implements ValidatorConstraintInterface {
  validate(emailOrMobile: string) {
    return isEmailOrMobile(emailOrMobile);
  }
}

function IsEmailOrMobile(validationOptions?: ValidationOptions) {
  return function runRegisterDecorator(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: Record<string, any>,
    propertyName: string,
  ): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailOrMobileConstraint,
    });
  };
}

export { IsEmailExists, IsEmailOrMobile };
