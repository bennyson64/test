module.exports = function (api) {
  api.cache(true);

  plugins.push('react-native-worklets/plugin');

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            // @/* -> local files
            "@": "./",
            // @workspace/openapi -> packages/openapi/src
            "@workspace/openapi": "../../packages/openapi/src/index.ts",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
