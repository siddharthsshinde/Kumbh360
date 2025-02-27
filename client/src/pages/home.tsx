import { ChatInterface } from "@/components/ChatInterface";
import { WeatherWidget } from "@/components/WeatherWidget";
import { FacilityMap } from "@/components/FacilityMap";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => i18n.changeLanguage("en")}
            className={i18n.language === "en" ? "bg-[#FF7F00] text-white" : ""}
          >
            English
          </Button>
          <Button
            variant="outline"
            onClick={() => i18n.changeLanguage("hi")}
            className={i18n.language === "hi" ? "bg-[#FF7F00] text-white" : ""}
          >
            हिंदी
          </Button>
          <Button
            variant="outline"
            onClick={() => i18n.changeLanguage("mr")}
            className={i18n.language === "mr" ? "bg-[#FF7F00] text-white" : ""}
          >
            मराठी
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ChatInterface />
          </div>
          <div className="space-y-8">
            <WeatherWidget />
            <CrowdLevelIndicator />
          </div>
        </div>

        <FacilityMap />
      </div>
    </div>
  );
}