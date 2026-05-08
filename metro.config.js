/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const {
    resolver: { sourceExts, assetExts }
  } = defaultConfig;

  const config = {
    transformer: {
      // let the svg transformer handle only .svg files; it forwards the rest to RN’s transformer
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: { experimentalImportSupport: false, inlineRequires: true }
      })
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg']
    }
  };

  const mergedConfig = mergeConfig(defaultConfig, config);

  const withReanimatedConfig = wrapWithReanimatedMetroConfig(mergedConfig);

  return withSentryConfig(withReanimatedConfig);
})();
