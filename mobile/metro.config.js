// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add support for various image formats
config.resolver.assetExts.push(
  // Image formats
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg"
);

// ✅ Important: Export synchronously and directly
module.exports = withNativeWind(config, {
  input: "./global.css",
});
