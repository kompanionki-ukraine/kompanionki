module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "babel-plugin-transform-inline-environment-variables",
      {
        include: [
          "SUPABASE_URL",
          "SUPABASE_ANON_KEY",
          "GOOGLE_WEB_CLIENT_ID",
          "GOOGLE_IOS_CLIENT_ID",
          "OAUTH_REDIRECT_URL",
          "API_BASE_URL",
        ],
      },
    ],
  ],
};
