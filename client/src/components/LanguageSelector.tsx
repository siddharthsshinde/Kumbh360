import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

// We're limiting the languages to just EN, Hindi and Marathi as requested
const SUPPORTED_LANGUAGES = {
  en: "EN",
  hi: "हिं",
  mr: "मरा"
};

/**
 * Global language selector component that changes the language for the entire application
 */
export function LanguageSelector() {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (value: string) => {
    // Update i18n language
    i18n.changeLanguage(value);
    
    // Store the selection in localStorage for persistence
    localStorage.setItem("kumbh-app-language", value);
    
    // Dispatch a custom event so other components can respond to the language change
    window.dispatchEvent(new CustomEvent("language-changed", { detail: { language: value } }));
  };

  return (
    <div className="flex items-center space-x-1 px-2">
      <Globe className="h-4 w-4 text-white" />
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-16 h-8 text-sm bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="EN" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}