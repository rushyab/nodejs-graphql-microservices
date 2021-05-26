/**
 * For testing: https://www.regextester.com/
 */

export const EMAIL_REG_EXP = new RegExp(
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
);

// Matches 10 digit mobile number that starts with either 6, 7, 8 or 9
export const MOBILE_REG_EXP = new RegExp(/^[6789]\d{9}$/);

export const DIGITS_REG_EXP = new RegExp(/^\d+$/);

export const JWT_REG_EXP = new RegExp(
  /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
);

/**
 * Can be used to test firstName/lastName/fullName
 *
 * Grammar Rules:
 * - Should start with a alphabet
 * - In middle,
 *   - can contain any number of alphabets,
 *   - or a `'`(quote) or ` `(space) followed by one or more alphabets,
 *   - or `.`(dot) followed by a ` `(space) and one or more alphabets
 * - Should end with a alphabet, or a `.`(dot).
 *
 * Allowed Examples:
 * - A
 * - A B
 * - A B C (so on)
 * - A.
 * - A. B.
 * - A. B. C. (so on)
 * - Edyth O'Keefe
 * - Mr. David
 * - Robert Downey Jr.
 *
 */
export const NAME_REG_EXP = new RegExp(
  /^[a-zA-Z]+(([' ][a-zA-Z])?([.][ ][a-zA-Z])?[a-zA-Z]*)*[.]?$/,
);
// Tested for around 10 Million inputs generated using faker.js methods
// `findName()`, `firstName()` and `lastName()`
