export { expect as cExpect } from 'chai';
export * from './cloneContextWithUnauthorizedRole';
export * from './commonAssertions';
export * from './fastCheck';
export * from './uniqueEmail';

export const mockReq = {};
export const mockRes = {
  cookie: (): Record<string, unknown> => ({}),
};
