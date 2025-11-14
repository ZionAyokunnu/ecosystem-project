const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.transformer.minifierConfig = {
  keep_classnames: true,
  mangle: {
    keep_classnames: true,
  },
};

config.resolver.alias = {
  '@': './src',
};

module.exports = withNativeWind(config, { input: './global.css' });
