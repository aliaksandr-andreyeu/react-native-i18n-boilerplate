module.exports = {
  presets: ['@react-native/babel-preset'],
  env: {
    development: {
      compact: false
    },
    production: {
      plugins: ['transform-remove-console']
    }
  },
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        root: '.',
        alias: {
          '@': './src'
        }
      }
    ],
    'react-native-reanimated/plugin'
  ]
};
