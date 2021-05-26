const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  roots: ["./src"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  setupFiles: [
    'dotenv/config'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: process.env.NODE_ENV === "testing",
  bail: process.env.NODE_ENV === "testing",
  collectCoverage: true,
  coverageReporters: [
    "html"
  ],
};