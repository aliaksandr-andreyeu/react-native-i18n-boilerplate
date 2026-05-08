module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true
    },
    android: {}
  },
  assets: ['./assets/fonts'],
  dependencies: {
    'react-native-config': {
      platforms: {
        ios: {},
        android: null
      }
    }
  }
};
