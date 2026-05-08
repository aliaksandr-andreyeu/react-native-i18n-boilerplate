module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-native-gesture-handler|@react-native-async-storage|@react-native-community/netinfo|d3-shape|react-native-wagmi-charts|@sumsub/react-native-mobilesdk-module|react-native-keyboard-controller|react-native-webview|@react-native-clipboard/clipboard|mixpanel-react-native|query-string|@react-native-cookies/cookies|@react-native-google-signin/google-signin|@react-native-firebase|@cherry-soft/react-native-basic-pagination)',
  ],
  moduleNameMapper: {
    '^@react-native-firebase/messaging$':
      '<rootDir>/__mocks__/@react-native-firebase/messaging.ts',
  },
  // Add this line to ignore specific file(s)
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/navigation/index.tsx'],
};
