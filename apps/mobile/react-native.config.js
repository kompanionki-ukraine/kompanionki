const path = require("path");

const root = path.resolve(__dirname, "../..");

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  // Tell the CLI where to find packages in the monorepo root
  // so auto-linking works with hoisted node_modules
  dependencies: {
    "react-native-keychain": {
      root: path.join(root, "node_modules/react-native-keychain"),
    },
    "react-native-gesture-handler": {
      root: path.join(root, "node_modules/react-native-gesture-handler"),
    },
    "react-native-screens": {
      root: path.join(root, "node_modules/react-native-screens"),
    },
    "react-native-safe-area-context": {
      root: path.join(root, "node_modules/react-native-safe-area-context"),
    },
    "react-native-svg": {
      root: path.join(root, "node_modules/react-native-svg"),
    },
    "react-native-vector-icons": {
      root: path.join(root, "node_modules/react-native-vector-icons"),
    },
    "@react-native-async-storage/async-storage": {
      root: path.join(root, "node_modules/@react-native-async-storage/async-storage"),
    },
    "@react-native-community/netinfo": {
      root: path.join(root, "node_modules/@react-native-community/netinfo"),
    },
  },
};
