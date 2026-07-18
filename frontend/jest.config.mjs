const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: { transform: { react: { runtime: 'automatic' } } },
    }],
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};

export default config;
