import { AuthenticationError } from 'apollo-server-express';
import moment from 'moment';
import { EntityManager } from 'typeorm';
import VerificationTrackerEntity from '../../../database/entities/VerificationTracker';

const MAXIMUM_VERIFICATION_CODE_SENT_ATTEMPTS = 5;
const RETRY_SEND_VERIFICATION_CODE_IN_MINUTES = 10;

const MAXIMUM_VERIFICATION_ATTEMPTS = 5;
const RETRY_VERIFICATION_IN_MINUTES = 10;

const EXCESS_ATTEMPTS_MSG =
  'Too many attempts. Please wait a while and try again.';

const save = async (
  verificationTracker: VerificationTrackerEntity,
  entityManager?: EntityManager,
) => {
  if (entityManager) {
    return entityManager.save(verificationTracker);
  }
  return verificationTracker.save();
};

const checkSendVerificationCodeAttempts = async (
  verificationTracker: VerificationTrackerEntity,
  entityManager?: EntityManager,
): Promise<void> => {
  const currentTime = new Date();

  const verificationSentDiff = moment(currentTime).diff(
    moment(verificationTracker.lastVerificationCodeSent),
    'minutes',
  );

  if (
    verificationTracker.sendVerificationCodeAttempts >=
      MAXIMUM_VERIFICATION_CODE_SENT_ATTEMPTS &&
    verificationSentDiff <= RETRY_SEND_VERIFICATION_CODE_IN_MINUTES
  ) {
    throw new Error(EXCESS_ATTEMPTS_MSG);
  }

  if (
    !verificationTracker.lastVerificationCodeSent ||
    verificationSentDiff > RETRY_SEND_VERIFICATION_CODE_IN_MINUTES
  ) {
    verificationTracker.lastVerificationCodeSent = currentTime;
    verificationTracker.sendVerificationCodeAttempts = 1;

    await save(verificationTracker, entityManager);
  } else {
    verificationTracker.sendVerificationCodeAttempts += 1;

    await save(verificationTracker, entityManager);
  }
};

const checkInvalidVerificationAttempts = async (
  verificationTracker: VerificationTrackerEntity,
  verificationCode: string,
  entityManager?: EntityManager,
): Promise<void> => {
  const currentTime = new Date();

  const verificationAttemptDiff = moment(currentTime).diff(
    moment(verificationTracker.lastVerificationAttempt),
    'minutes',
  );

  if (
    verificationTracker.verificationAttempts >= MAXIMUM_VERIFICATION_ATTEMPTS &&
    verificationAttemptDiff <= RETRY_VERIFICATION_IN_MINUTES
  ) {
    throw new Error(EXCESS_ATTEMPTS_MSG);
  }

  // If verificationCode is invalid, update the verifcation attempts
  if (verificationTracker.code !== verificationCode) {
    if (
      !verificationTracker.lastVerificationAttempt ||
      verificationAttemptDiff > RETRY_VERIFICATION_IN_MINUTES
    ) {
      verificationTracker.lastVerificationAttempt = currentTime;
      verificationTracker.verificationAttempts = 1;

      await save(verificationTracker, entityManager);
    } else {
      verificationTracker.verificationAttempts += 1;

      await save(verificationTracker, entityManager);
    }

    if (
      verificationTracker.verificationAttempts >= MAXIMUM_VERIFICATION_ATTEMPTS
    ) {
      throw new AuthenticationError(EXCESS_ATTEMPTS_MSG);
    } else {
      throw new AuthenticationError('Invalid credentials!');
    }
  }
};

export default {
  checkInvalidVerificationAttempts,
  checkSendVerificationCodeAttempts,
};
