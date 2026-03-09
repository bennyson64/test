const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
// Go up two levels: apps/mobile -> apps -> repo root
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the entire monorepo so Metro picks up changes in packages/*
config.watchFolders = [monorepoRoot];

// 2. Resolve node_modules from both the app folder and the monorepo root
//    (pnpm hoists shared deps to the root node_modules)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Alias @workspace/openapi at runtime (Metro doesn't use tsconfig paths)
config.resolver.extraNodeModules = {
  "@workspace/openapi": path.resolve(monorepoRoot, "packages/openapi/src"),
};

module.exports = withNativeWind(config, { input: "./global.css" });