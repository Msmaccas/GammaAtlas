module.exports = {
  roots: ["<rootDir>/packages", "<rootDir>/tests"],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: false
};