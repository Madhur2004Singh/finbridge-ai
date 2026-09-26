import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const r = {
  en: {
    translation: {
      dashboard: "Dashboard",
      schemes: "Government Schemes",
      tracker: "Financial Tracker",
      literacy: "Financial Literacy",
      profile: "Profile",
      login: "Login",
      signup: "Sign up",
      logout: "Logout",
      total: "Total expenses",
      add: "Add expense",
      save: "Save",
      search: "Search",
      details: "Details",
      eligibility: "Eligibility",
      benefits: "Benefits",
      documents: "Documents required",
      application: "How to apply",
    },
  },
  hi: {
    translation: {
      dashboard: "डैशबोर्ड",
      schemes: "सरकारी योजनाएँ",
      tracker: "वित्तीय ट्रैकर",
      literacy: "वित्तीय साक्षरता",
      profile: "प्रोफ़ाइल",
      login: "लॉगिन",
      signup: "साइन अप",
      logout: "लॉग आउट",
      total: "कुल खर्च",
      add: "खर्च जोड़ें",
      save: "सहेजें",
      search: "खोजें",
      details: "विवरण",
      eligibility: "पात्रता",
      benefits: "लाभ",
      documents: "आवश्यक दस्तावेज़",
      application: "आवेदन कैसे करें",
    },
  },
  kn: {
    translation: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      tracker: "ಹಣಕಾಸು ಟ್ರ್ಯಾಕರ್",
      literacy: "ಹಣಕಾಸು ಸಾಕ್ಷರತೆ",
      profile: "ಪ್ರೊಫೈಲ್",
      login: "ಲಾಗಿನ್",
      signup: "ಸೈನ್ ಅಪ್",
      logout: "ಲಾಗ್‌ಔಟ್",
      total: "ಒಟ್ಟು ವೆಚ್ಚ",
      add: "ವೆಚ್ಚ ಸೇರಿಸಿ",
      save: "ಉಳಿಸಿ",
      search: "ಹುಡುಕಿ",
      details: "ವಿವರಗಳು",
      eligibility: "ಅರ್ಹತೆ",
      benefits: "ಲಾಭಗಳು",
      documents: "ಅಗತ್ಯ ದಾಖಲೆಗಳು",
      application: "ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು",
    },
  },
};

i18n.use(initReactI18next).init({
  resources: r,
  lng: "en",
  fallbackLng: "en",
});

export default i18n;