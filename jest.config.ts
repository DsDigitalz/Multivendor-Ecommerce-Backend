import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          parser: { syntax: 'typescript', tsx: false, decorators: false },
        },
        module: { type: 'commonjs' },
      },
    ],
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
};

export default config;
