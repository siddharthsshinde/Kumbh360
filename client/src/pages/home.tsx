import { ChatInterface } from "@/components/ChatInterface";
import { WeatherWidget } from "@/components/WeatherWidget";
import { FacilityMap } from "@/components/FacilityMap";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { RealTimeSafetySuggestion } from "@/components/RealTimeSafetySuggestion";
import { NewsWidget } from "@/components/NewsWidget";
import { KumbhLocationsInfo } from "@/components/KumbhLocationsInfo";
import { AccommodationFinder } from "@/components/AccommodationFinder";
import { TransportationGuide } from "@/components/TransportationGuide";
import { EmergencyTransport } from "@/components/EmergencyTransport";
import { StreetView } from "@/components/StreetView";
import { LostAndFound } from "@/components/LostAndFound";
import { MapPin, AlertCircle, Camera, UserSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PrayerSubmission } from "@/components/PrayerSubmission";

export default function Home() {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [showStreetView, setShowStreetView] = useState(false);
  const [showLostAndFound, setShowLostAndFound] = useState(false);
  const [activeTab, setActiveTab] = useState("main");

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast({
            title: "Location Shared",
            description: "Your location has been shared with emergency services.",
            variant: "default"
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location sharing.",
        variant: "destructive"
      });
    }
  };

  const handleSOS = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "Emergency services have been notified. Stay calm, help is on the way.",
      variant: "destructive",
      duration: 10000
    });
  };

  // Mobile navigation tabs
  const tabs = [
    { id: "main", label: "Main" },
    { id: "maps", label: "Maps" },
    { id: "info", label: "Info" },
    { id: "transport", label: "Transport" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Section - Fixed at the top */}
      <header className="sticky top-0 z-50 bg-white shadow-md px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#FF7F00] hidden md:block">Kumbh Mela 2025</h1>
            
            {/* Emergency Buttons - Always visible */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleShareLocation}
                className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs sm:text-sm"
                size="sm"
              >
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Share Location</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleSOS}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm"
                size="sm"
              >
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">SOS</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowStreetView(!showStreetView)}
                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm"
                size="sm"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{showStreetView ? 'Hide View' : 'Street View'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLostAndFound(!showLostAndFound)}
                className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs sm:text-sm"
                size="sm"
              >
                <UserSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{showLostAndFound ? 'Hide Lost & Found' : 'Lost & Found'}</span>
              </Button>
            </div>
            
            {/* Language Selector */}
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => i18n.changeLanguage("en")}
                className={`${i18n.language === "en" ? "bg-[#FF7F00] text-white" : ""} text-xs px-2 py-1`}
                size="sm"
              >
                EN
              </Button>
              <Button
                variant="outline"
                onClick={() => i18n.changeLanguage("hi")}
                className={`${i18n.language === "hi" ? "bg-[#FF7F00] text-white" : ""} text-xs px-2 py-1`}
                size="sm"
              >
                हिं
              </Button>
              <Button
                variant="outline"
                onClick={() => i18n.changeLanguage("mr")}
                className={`${i18n.language === "mr" ? "bg-[#FF7F00] text-white" : ""} text-xs px-2 py-1`}
                size="sm"
              >
                मरा
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pb-20 pt-4">
        {/* Mobile Tab Navigation - Only visible on small screens */}
        <div className="md:hidden mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 border-b border-gray-200 pb-2">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`rounded-full text-sm px-4 ${activeTab === tab.id ? "bg-[#FF7F00] text-white" : "text-gray-600"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {showStreetView && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
            <StreetView />
          </div>
        )}

        {showLostAndFound && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
            <LostAndFound />
          </div>
        )}

        {/* Safety Alert - Always Visible */}
        <div className="mb-6 rounded-lg shadow-md overflow-hidden border-l-4 border-[#FF7F00]">
          <RealTimeSafetySuggestion />
        </div>

        {/* Main Content Sections */}
        <div className={`space-y-6 ${(activeTab === "main" || activeTab === "info") ? "" : "hidden md:block"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-2 h-full flex flex-col">
              <ChatInterface />
            </div>
            <div className="space-y-4 h-full flex flex-col">
              <WeatherWidget />
              <div className="flex-grow">
                <CrowdLevelIndicator />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <NewsWidget />
          </div>
        </div>

        {/* Maps Content Section */}
        <div className={`space-y-6 ${(activeTab === "maps" || activeTab === "main") ? "" : "hidden md:block"}`}>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <FacilityMap />
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <KumbhLocationsInfo />
          </div>
        </div>

        {/* Travel & Accommodations Content Section */}
        <div className={`space-y-6 ${(activeTab === "transport" || activeTab === "info") ? "" : "hidden md:block"}`}>
          <div className="rounded-lg overflow-hidden shadow-md">
            <AccommodationFinder/>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden shadow-md">
              <EmergencyTransport />
            </div>
            <div className="rounded-lg overflow-hidden shadow-md">
              <TransportationGuide />
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Submission now shown as a floating action button */}
      <div className="fixed bottom-4 right-4 z-40">
        <PrayerSubmission />
      </div>
    </div>
  );
}