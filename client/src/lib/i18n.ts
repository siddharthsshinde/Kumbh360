import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Get stored language preference or default to English
const getStoredLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kumbh-app-language') || 'en';
  }
  return 'en';
};

// Expanded translations for website-wide use
const resources = {
  en: {
    translation: {
      welcome: "Welcome to Nashik Kumbh Mela 2025! How can I help you today?",
      weather: "Weather",
      crowdLevel: "Crowd Level",
      facilities: "Find Facilities",
      emergency: "Emergency Services",
      temperature: "Temperature",
      humidity: "Humidity",
      windSpeed: "Wind Speed",
      searchPlaceholder: "Type your message here...",
      submitPrayer: "Submit Prayer",
      prayerSubmitted: "Your prayer has been submitted",
      prayerPlaceholder: "Enter your prayer here...",
      // Added site-wide translations
      home: "Home",
      about: "About",
      maps: "Maps & Navigation",
      services: "Services",
      contact: "Contact",
      settings: "Settings",
      accommodation: "Accommodation",
      transportation: "Transportation",
      safety: "Safety",
      language: "Language",
      chat: "Chat with Assistant",
      schedule: "Event Schedule",
      news: "Latest News",
      helpline: "Helpline"
    }
  },
  hi: {
    translation: {
      welcome: "नासिक कुंभ मेला 2025 में आपका स्वागत है! मैं आपकी कैसे मदद कर सकता हूं?",
      weather: "मौसम",
      crowdLevel: "भीड़ का स्तर",
      facilities: "सुविधाएं खोजें",
      emergency: "आपातकालीन सेवाएं",
      temperature: "तापमान",
      humidity: "नमी",
      windSpeed: "हवा की गति",
      searchPlaceholder: "अपना संदेश यहां टाइप करें...",
      submitPrayer: "प्रार्थना जमा करें",
      prayerSubmitted: "आपकी प्रार्थना जमा कर दी गई है",
      prayerPlaceholder: "अपनी प्रार्थना यहां दर्ज करें...",
      // Added site-wide translations
      home: "होम",
      about: "परिचय",
      maps: "नक्शे और नेविगेशन",
      services: "सेवाएं",
      contact: "संपर्क",
      settings: "सेटिंग्स",
      accommodation: "आवास",
      transportation: "परिवहन",
      safety: "सुरक्षा",
      language: "भाषा",
      chat: "सहायक से चैट करें",
      schedule: "कार्यक्रम समय-सारणी",
      news: "ताज़ा खबर",
      helpline: "हेल्पलाइन"
    }
  },
  mr: {
    translation: {
      welcome: "नाशिक कुंभमेळा २०२५ मध्ये आपले स्वागत आहे! मी आपली कशी मदत करू शकतो?",
      weather: "हवामान",
      crowdLevel: "गर्दीची पातळी",
      facilities: "सुविधा शोधा",
      emergency: "आपत्कालीन सेवा",
      temperature: "तापमान",
      humidity: "आर्द्रता",
      windSpeed: "वारा",
      searchPlaceholder: "आपला संदेश येथे टाइप करा...",
      latestNews: "ताजी बातम्या",
      liveNews: "लाईव्ह",
      loadingNews: "बातम्या लोड होत आहेत...",
      submitPrayer: "प्रार्थना सबमिट करा",
      prayerSubmitted: "आपली प्रार्थना सबमिट केली गेली आहे",
      prayerPlaceholder: "आपली प्रार्थना येथे टाइप करा...",
      // Added site-wide translations
      home: "मुख्यपृष्ठ",
      about: "आमच्याबद्दल",
      maps: "नकाशे आणि मार्गदर्शन",
      services: "सेवा",
      contact: "संपर्क",
      settings: "सेटिंग्ज",
      accommodation: "निवास",
      transportation: "परिवहन",
      safety: "सुरक्षा",
      language: "भाषा",
      chat: "सहाय्यकाशी चॅट करा",
      schedule: "कार्यक्रम वेळापत्रक",
      news: "बातम्या",
      helpline: "हेल्पलाइन"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    interpolation: {
      escapeValue: false
    }
  });

// Function to change language programmatically
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('kumbh-app-language', lang);
    // Dispatch an event so components can react to language changes
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { language: lang } }));
  }
};

export default i18n;