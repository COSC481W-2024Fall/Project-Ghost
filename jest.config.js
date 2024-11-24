module.exports = {
  setupFiles: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'], // Ensure this matches your test file pattern
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};