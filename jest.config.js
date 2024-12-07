module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  reporters: [
    'default', // Default Jest reporter
    [
      'jest-junit',
      {
        outputDirectory: './', // Directory for the output file
        outputName: 'unit.xml',           // Name of the output file
      },
    ],
  ],
};