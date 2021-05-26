import { AuthenticationError } from 'apollo-server-express';
import moment from 'moment';
import BlogAdminEntity from '../database/entities/BlogAdmin';
import StudentEntity from '../database/entities/Student';
import SuperAdminEntity from '../database/entities/SuperAdmin';

const MAXIMUM_UNSUCCESFUL_LOGIN_ATTEMPTS = 5;
const RETRY_TIME_IN_MINUTES = 10;

/**
 * @param user — User entity used for validation.
 * @param validateCredentialsCb — Callback that validates user credentials.
 *
 * @return — Promise that resolves to undefined if no error.
 */
const checkUnsuccessfulLoginAttempts = async (
  user: SuperAdminEntity | BlogAdminEntity | StudentEntity,
  validateCredentialsCb: () => Promise<boolean>,
): Promise<void> => {
  const currentTime = new Date();

  const loginTimeDiff = moment(currentTime).diff(
    moment(user.lastUnsuccessfullLoginAttempt),
    'minutes',
  );

  if (
    user.unsuccessfullLoginAttempts >= MAXIMUM_UNSUCCESFUL_LOGIN_ATTEMPTS &&
    loginTimeDiff <= RETRY_TIME_IN_MINUTES
  ) {
    throw new Error(
      'Maximum number of login Attempts exceeded. Wait 10 minutes before trying again.',
    );
  }

  if (!(await validateCredentialsCb())) {
    if (
      !user.lastUnsuccessfullLoginAttempt ||
      loginTimeDiff > RETRY_TIME_IN_MINUTES
    ) {
      user.lastUnsuccessfullLoginAttempt = currentTime;
      user.unsuccessfullLoginAttempts = 1;

      await user.save();
    } else {
      user.unsuccessfullLoginAttempts += 1;

      await user.save();
    }

    if (user.unsuccessfullLoginAttempts >= MAXIMUM_UNSUCCESFUL_LOGIN_ATTEMPTS) {
      throw new AuthenticationError(
        'Maximum number of login Attempts exceeded. Wait 10 minutes before trying again.',
      );
    } else {
      throw new AuthenticationError(
        `Invalid credentials. ${
          MAXIMUM_UNSUCCESFUL_LOGIN_ATTEMPTS - user.unsuccessfullLoginAttempts
        } attempts left`,
      );
    }
  }
};

export default checkUnsuccessfulLoginAttempts;
