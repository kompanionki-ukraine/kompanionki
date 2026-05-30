import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// JSON imports — resolved via resolveJsonModule + Metro watchFolders
const uk = require("../../../../packages/shared/src/locales/uk.json") as Record<string, unknown>;
const en = require("../../../../packages/shared/src/locales/en.json") as Record<string, unknown>;

i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    en: { translation: en },
  },
  lng: "uk",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
