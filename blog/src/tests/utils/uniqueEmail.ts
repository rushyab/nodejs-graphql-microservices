import faker from 'faker';
import { UPPER_CASE_ALPHABETS_STR, LOWER_CASE_ALPHABETS_STR } from '.';

type UniqueEmailOptions = {
  firstName?: string;
  lastName?: string;
};

const LIMIT = 1000000;
const RANDOM_STR_LEN = 5;
const ALPHABETS = UPPER_CASE_ALPHABETS_STR + LOWER_CASE_ALPHABETS_STR;

const randomNumber = () => Math.floor(Math.random() * LIMIT);

const randomAlphaString = (len: number) =>
  Array(len)
    .join()
    .split(',')
    .map(() => ALPHABETS.charAt(Math.floor(Math.random() * ALPHABETS.length)))
    .join('');

export function uniqueEmail(options?: UniqueEmailOptions): string {
  const { firstName, lastName } = options || {};

  // UPDATE pseudo-random number generator
  faker.seed(randomNumber());

  // Append randomly generated string to first and last name
  const fName =
    (firstName || faker.name.firstName()) + randomAlphaString(RANDOM_STR_LEN);

  faker.seed(randomNumber());

  const lName =
    (lastName || faker.name.lastName()) + randomAlphaString(RANDOM_STR_LEN);

  return faker.internet.email(fName, lName);
}
