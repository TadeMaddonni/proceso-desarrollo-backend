export default {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        useESM: true
      }],
    },
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
    ],
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@config/(.*)$': '<rootDir>/src/config/$1',
      '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
      '^@services/(.*)$': '<rootDir>/src/services/$1',
      '^@models/(.*)$': '<rootDir>/src/models/$1',
      '^@dtos/(.*)$': '<rootDir>/src/dtos/$1',
      '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
      '^@utils/(.*)$': '<rootDir>/src/utils/$1',
      '^@types/(.*)$': '<rootDir>/src/types/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
  };