const nextJest = require('next/jest')
const { excludeRegexps } = require('./test/coverage.config');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  collectCoverageFrom: [
      "src/**/*.ts",
      "src/**/*.tsx"
  ],
  coveragePathIgnorePatterns: excludeRegexps.map(regex => regex.source),
  coverageDirectory: "<rootDir>/coverage/unit",
  /*coverageThreshold: {
      global: {
          branches: 20,
          functions: 30,
          lines: 50,
          statements: 50
      }
  },*/
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(test).[jt]s?(x)"
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 