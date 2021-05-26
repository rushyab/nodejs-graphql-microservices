import bcrypt from 'bcrypt';

/**
 * @param password — The data to be encrypted.
 * @param hash — The data to be compared against.
 *
 * @return — A promise to be either resolved with true if password matches hash, or false if doesn't match
 */
export function comparePasswordToHash(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
