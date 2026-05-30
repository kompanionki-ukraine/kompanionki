This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Environment variables (`dotenvx`)

1. Create **`apps/mobile/.env.development`** locally (do not commit secrets; encrypted files are team policy) with at least:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=
GOOGLE_WEB_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
OAUTH_REDIRECT_URL=kompanionki://auth-callback
API_BASE_URL=http://localhost:3000
```

(Supabase keys: Dashboard → Settings → API. Google: OAuth client IDs. Android emulator API host often **`http://10.0.2.2:3000`** — override **`API_BASE_URL`** or leave empty for code defaults.)

2. **`npm start`** / **`npm run ios`** / **`npm run android`** run via **`dotenvx run -fk ../../.env.keys -f .env.development`**, which loads that file into the Node process before Metro bundles your JS. Babel inlines the listed keys into the bundle (see **`babel.config.js`** + **`src/config/publicEnv.ts`**).
3. **Team workflow (encrypted files):** Use **one** repo-root **`.env.keys`** (see root **`README.md`** §2). NPM scripts use **`-fk ../../.env.keys`** so API and mobile share **`DOTENV_PRIVATE_KEY_DEVELOPMENT`** — no second `.env.keys` under **`apps/mobile`**.
4. To edit encrypted vars: **`npx dotenvx set KEY "value" -fk ../../.env.keys -f apps/mobile/.env.development`** (run from repo root or adjust paths), or **`dotenvx encrypt`** after editing plain text locally.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run from the **repository root** (npm workspaces):

```sh
npm start
```

## Step 2: Build and run your app

With Metro running, open another terminal. From the **repository root** or **`apps/mobile`**, run:

### Android

```sh
npm run android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
npm run pod-install
```

From `apps/mobile/ios`, the same step is `bundle exec pod install`.

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
npm run ios
```

**Simulator vs device:** **`npm run ios`** targets the **iOS Simulator** by default (currently **`iPhone 16 Pro`** in `package.json`). To run on a **physical iPhone** (USB): configure **Signing & Capabilities** in Xcode for the **Kompanionki** target (**Team**), unlock the phone, trust the computer if prompted, then start Metro (`npm start`) and run **`npm run ios:device`**. That script writes your Mac’s LAN IP into **`ios/Kompanionki/ip.txt`** so the phone can load JS from Metro on port **9087** — **iPhone and Mac must be on the same Wi‑Fi** (USB alone does not forward Metro). For API calls from the device, set **`API_BASE_URL`** to `http://YOUR_MAC_LAN_IP:3000`, not `localhost`. Override the simulator: `npm run ios -- --simulator "iPhone 16 Pro"` (names from `xcrun simctl list devices available`).

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

### `xcodebuild` / Command Line Tools vs Xcode

Install **Xcode** from the App Store and keep **`Xcode.app`** in **`/Applications`** (or adjust the path below). Then:

```sh
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept   # if prompted
```

Verify: `xcode-select -p` should end with `Xcode.app/Contents/Developer`, and `xcodebuild -version` should print an Xcode version.

If you use **Xcode-beta.app** or a non-default path, point `xcode-select` at that app’s **`Contents/Developer`** instead.

More help: [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting).

### Provisioning profile / signing (physical device)

That error appears when building for a **connected iPhone** without a valid **development team** / profile. Use **`npm run ios`** (simulator) instead, or open **`ios/Kompanionki.xcworkspace`** in Xcode → target **Kompanionki** → **Signing & Capabilities** → select your **Team**, then **`npm run ios:device`**.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
