module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__fixtures__/',
    '/spec/'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/exec.ts'],
  moduleNameMapper: {
    '^@formulajs/formulajs$': '<rootDir>/node_modules/@formulajs/formulajs/lib/cjs/index.cjs',
    '^d3$': '<rootDir>/node_modules/d3/dist/d3.js'
  },
};
