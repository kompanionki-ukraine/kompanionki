// ─── Custom Font ─────────────────────────────────────────────────────────────
// Recht removed temporarily. Replace the snippet below once a licensed font
// is approved. Steps:
//   1. Drop .otf files into src/assets/fonts/
//   2. Run `npx react-native-asset` (or `react-native link`) to copy to Android/iOS
//   3. Add iOS PostScript names to UIAppFonts in ios/Kompanionki/Info.plist
//   4. Add Xcode file/build references in project.pbxproj
//   5. Uncomment and adapt the export below, import in theme/index.ts
//
// import { Platform } from 'react-native';
//
// export const BrandFont = Platform.select({
//   ios: {
//     regular:  'PostScriptName-Regular',
//     bold:     'PostScriptName-Bold',
//     // … other weights
//   },
//   android: {
//     regular:  'filename-stem-regular',
//     bold:     'filename-stem-bold',
//     // … other weights
//   },
//   default: {
//     regular:  'filename-stem-regular',
//     bold:     'filename-stem-bold',
//   },
// })!;
//
// export function font(weight: keyof typeof BrandFont): { fontFamily: string } {
//   return { fontFamily: BrandFont[weight] };
// }
