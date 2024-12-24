module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: ['src/**/*.ts'],
  moduleNameMapper: {
    '^@formulajs/formulajs$': '<rootDir>/node_modules/@formulajs/formulajs/lib/cjs/index.cjs',
    '^d3$': '<rootDir>/node_modules/d3/dist/d3.js'
  },
};
