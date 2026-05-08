const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const root = path.resolve(__dirname, "../..");

/**
 * Metro config for Turborepo monorepo.
 * watchFolders must include the repo root so Metro can see packages/shared.
 * resolver.nodeModulesPaths ensures packages hoisted to the root are found.
 */
const config = {
  /** Dedicated port — avoids 8081/8082 (Expo / other Metro) collisions. */
  server: {
    port: 9087,
  },
  watchFolders: [root],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(root, "node_modules"),
    ],
    // Alias @kompanionki/shared → packages/shared/src/index.ts
    extraNodeModules: {
      "@kompanionki/shared": path.resolve(root, "packages/shared/src"),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
