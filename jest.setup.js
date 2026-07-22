// Runs before each test file. Mocks native-bridge modules that Jest can't
// execute (no real device/simulator exists in a Node test environment).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
