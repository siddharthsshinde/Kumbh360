import { ChatInterface } from "@/components/ChatInterface";
import { WeatherWidget } from "@/components/WeatherWidget";
import { FacilityMap } from "@/components/FacilityMap";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { RealTimeSafetySuggestion } from "@/components/RealTimeSafetySuggestion";
import { NewsWidget } from "@/components/NewsWidget";
import { KumbhLocationsInfo } from "@/components/KumbhLocationsInfo";
import { EventSchedule } from "@/components/EventSchedule";
import { TransportationGuide } from "@/components/TransportationGuide";
import { AccommodationFinder } from "@/components/AccommodationFinder";
import { VirtualTours } from "@/components/VirtualTours";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function Home() {
  const { i18n, t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#FF7F00]">
            {i18n.language === "en" ? "Kumbh Mela 2025 Nashik" : 
             i18n.language === "hi" ? "कुंभ मेला 2025 नासिक" : 
             "कुंभ मेळा 2025 नाशिक"}
          </h1>
          <div className="flex gap-2">
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

        <div className="grid grid-cols-1 gap-4 mb-4">
          <RealTimeSafetySuggestion />
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
        <div className="mb-6">
          <NewsWidget />
        </div>
        <FacilityMap />
        <KumbhLocationsInfo /> {/* Added KumbhLocationsInfo component */}
      </div>
    </div>
  );
}