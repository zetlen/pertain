module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  bail: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/*.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
  moduleDirectories: ['node_modules', 'src/__tests__/__fixtures__'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/*.ts'],
  testPathIgnorePatterns: ['.d.ts']
};
