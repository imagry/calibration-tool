module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest', '^.+\\.(js|jsx)$': 'babel-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
