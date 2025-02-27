import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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
      windSpeed: "वाऱ्याचा वेग",
      searchPlaceholder: "आपला संदेश येथे टाइप करा...",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;