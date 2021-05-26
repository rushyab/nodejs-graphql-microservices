import { GraphQLError } from 'graphql';
import { ForbiddenError } from 'type-graphql';
import { cExpect } from '.';
import {
  ARGUMENT_TYPE_ERROR_MSG_CONTAINS,
  ERR_MSG_ARGUMENT_VALIDATION_FAIL,
  UNAUTHENTICATED_ERROR_CODE,
} from '../../constants/errorMessages';

const expectErrorsArr = (errors?: ReadonlyArray<GraphQLError>): void => {
  cExpect(errors, JSON.stringify(errors))
    .to.be.a('array')
    .lengthOf.greaterThan(0);
};

const expectArgumentTypeOrValidationError = (
  errors?: ReadonlyArray<GraphQLError>,
): void => {
  const errMsg = errors?.[0]?.message || '';
  cExpect(
    errMsg === ERR_MSG_ARGUMENT_VALIDATION_FAIL ||
      errMsg.includes(ARGUMENT_TYPE_ERROR_MSG_CONTAINS),
    JSON.stringify(errors),
  ).to.be.true;
};

const expectUnauthenticationError = (
  errors?: ReadonlyArray<GraphQLError>,
): void => {
  cExpect(errors?.[0].extensions?.code, JSON.stringify(errors)).to.equal(
    UNAUTHENTICATED_ERROR_CODE,
  );
};

const expectErrorMsg = (
  message: string,
  errors?: ReadonlyArray<GraphQLError>,
): void => {
  expectErrorsArr(errors);
  cExpect(errors?.[0].message, JSON.stringify(errors)).to.equal(message);
};

const expectForbiddenError = (errors?: ReadonlyArray<GraphQLError>): void => {
  expectErrorMsg(new ForbiddenError().message, errors);
};

export {
  expectErrorsArr,
  expectArgumentTypeOrValidationError,
  expectUnauthenticationError,
  expectErrorMsg,
  expectForbiddenError,
};
