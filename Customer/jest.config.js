/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  coverageProvider: "v8",
  moduleFileExtensions: ['.js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
};